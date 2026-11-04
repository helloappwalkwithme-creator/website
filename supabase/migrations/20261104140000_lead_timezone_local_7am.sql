-- Capture the signup timezone and only include a lead in the morning
-- send when it is 07:00 in that zone. Missing or unknown zones stay on
-- Europe/Berlin, which is when the day-by-day motor used to run.
-- Additive: adds a column, replaces register_lead, adds a helper, replaces
-- the view the Make scenario already reads. Does not delete rows.

alter table public.leads add column if not exists timezone text;

create or replace function public.lead_local_hour(p_timezone text)
returns integer
language plpgsql
stable
set search_path to 'public'
as $$
declare
  v_tz text;
begin
  v_tz := nullif(btrim(p_timezone), '');
  if v_tz is null or not exists (select 1 from pg_timezone_names where name = v_tz) then
    v_tz := 'Europe/Berlin';
  end if;
  return extract(hour from (now() at time zone v_tz))::integer;
end;
$$;

create or replace function public.register_lead(
  p_email text,
  p_first_name text,
  p_delivery_channel text,
  p_source text,
  p_language text,
  p_onboarding_data jsonb,
  p_access_code text,
  p_chosen_path text,
  p_flow_name text
) returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_flow_name text;
  v_email     text;
  v_stored    text;
  v_timezone  text;
begin
  v_email := lower(btrim(p_email));
  v_flow_name := coalesce(map_flow_name(p_source, p_onboarding_data->>'root_problem'), p_flow_name);
  v_timezone := nullif(btrim(p_onboarding_data->>'timezone'), '');
  if v_timezone is not null and not exists (select 1 from pg_timezone_names where name = v_timezone) then
    v_timezone := null;
  end if;

  insert into public.leads (
    email, first_name, delivery_channel, source, language,
    marketing_consent, onboarding_data, access_code, chosen_path, timezone
  )
  values (
    v_email, p_first_name, p_delivery_channel, p_source, p_language,
    public.explicit_marketing_consent(p_onboarding_data), p_onboarding_data, p_access_code, p_chosen_path, v_timezone
  )
  on conflict ((lower(email))) do update set
    first_name        = excluded.first_name,
    delivery_channel  = excluded.delivery_channel,
    language          = excluded.language,
    onboarding_data   = excluded.onboarding_data,
    access_code       = excluded.access_code,
    chosen_path       = excluded.chosen_path,
    timezone          = coalesce(excluded.timezone, public.leads.timezone),
    marketing_consent = coalesce(public.leads.marketing_consent, false) or coalesce(excluded.marketing_consent, false)
  returning email into v_stored;

  update public.active_flows
     set status = 'paused'
   where lower(lead_email) = v_email
     and status = 'active'
     and flow_name is distinct from v_flow_name
     and flow_name not like 'trigmap_%';

  insert into public.active_flows (lead_email, flow_name, current_mentoring_day, has_paid, status)
  values (coalesce(v_stored, v_email), v_flow_name, 1, false, 'active')
  on conflict (lead_email, flow_name) do update set
    status = 'active';
end;
$$;

create or replace view public.active_flows_filtered as
 select af.id,
    af.lead_email,
    af.flow_name,
    l.current_mentoring_day,
    l.has_paid,
    af.status,
    af.new_belief,
    af.toxic_belief
   from public.active_flows af
     join public.leads l on l.email = af.lead_email
  where af.status = 'active'
    and (af.flow_name <> all (array['sleep_flow','morning_flow','stress_flow','clearstate_flow']))
    and (l.current_mentoring_day <= 4 or (l.current_mentoring_day > 4 and l.has_paid = true))
    and (
      l.delivery_channel = 'whatsapp' and l.phone_number is not null and l.whatsapp_status = 'active'
      or l.delivery_channel = 'telegram' and l.telegram_chat_id is not null and l.telegram_chat_id ~ '^-?[0-9]+$'
    )
    and (l.delivery_channel <> 'whatsapp' or l.last_sent_day is distinct from l.current_mentoring_day)
    and af.flow_name !~~ 'fokus12\_%'
    and public.lead_local_hour(coalesce(nullif(btrim(l.timezone), ''), l.onboarding_data->>'timezone')) = 7;
