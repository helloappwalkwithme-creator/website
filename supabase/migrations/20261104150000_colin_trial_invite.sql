-- Only a stored invite token may start the free Bible trial.
-- Everyone else stays out of the morning send until has_paid is true.
-- Existing leads are not deleted.

alter table public.leads add column if not exists free_trial boolean not null default false;

create table if not exists public.trial_invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  label text not null,
  path text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.trial_invites enable row level security;
revoke all on table public.trial_invites from anon, authenticated;

insert into public.trial_invites (token, label, path)
values ('7a3308bb1f71f6305b0c8b77c2650aa1cc142605ba6dbdab', 'colin', 'bible')
on conflict (token) do nothing;

create or replace function public.trial_invite_valid(p_token text, p_path text)
returns boolean
language sql
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
      from public.trial_invites
     where token = p_token
       and active
       and path = p_path
  );
$$;

revoke all on function public.trial_invite_valid(text, text) from public;
grant execute on function public.trial_invite_valid(text, text) to anon, authenticated;

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
  v_token     text;
  v_trial     boolean := false;
begin
  v_email := lower(btrim(p_email));
  v_flow_name := coalesce(map_flow_name(p_source, p_onboarding_data->>'root_problem'), p_flow_name);
  v_timezone := nullif(btrim(p_onboarding_data->>'timezone'), '');
  if v_timezone is not null and not exists (select 1 from pg_timezone_names where name = v_timezone) then
    v_timezone := null;
  end if;

  v_token := nullif(btrim(p_onboarding_data->>'invite_token'), '');
  if v_token is not null then
    v_trial := public.trial_invite_valid(v_token, coalesce(p_chosen_path, ''));
  end if;

  if v_flow_name = 'bible_flow' and not v_trial then
    raise exception 'trial_invite_required' using errcode = '42501';
  end if;

  insert into public.leads (
    email, first_name, delivery_channel, source, language,
    marketing_consent, onboarding_data, access_code, chosen_path, timezone, free_trial
  )
  values (
    v_email, p_first_name, p_delivery_channel, p_source, p_language,
    public.explicit_marketing_consent(p_onboarding_data), p_onboarding_data, p_access_code, p_chosen_path, v_timezone,
    case when v_flow_name = 'bible_flow' then v_trial else false end
  )
  on conflict ((lower(email))) do update set
    first_name        = excluded.first_name,
    delivery_channel  = excluded.delivery_channel,
    language          = excluded.language,
    onboarding_data   = excluded.onboarding_data,
    access_code       = excluded.access_code,
    chosen_path       = excluded.chosen_path,
    timezone          = coalesce(excluded.timezone, public.leads.timezone),
    free_trial        = case
                          when v_flow_name = 'bible_flow' then excluded.free_trial
                          else public.leads.free_trial
                        end,
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
      af.flow_name <> 'bible_flow'
      or coalesce(l.has_paid, false) = true
      or (coalesce(l.free_trial, false) = true and l.current_mentoring_day <= 4)
    )
    and (
      l.delivery_channel = 'whatsapp' and l.phone_number is not null and l.whatsapp_status = 'active'
      or l.delivery_channel = 'telegram' and l.telegram_chat_id is not null and l.telegram_chat_id ~ '^-?[0-9]+$'
    )
    and (l.delivery_channel <> 'whatsapp' or l.last_sent_day is distinct from l.current_mentoring_day)
    and af.flow_name !~~ 'fokus12\_%'
    and public.lead_local_hour(coalesce(nullif(btrim(l.timezone), ''), l.onboarding_data->>'timezone')) = 7;
