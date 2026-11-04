-- Email is a real delivery channel.
-- A lead who chooses email is due at 07:00 in their own timezone, with no chat link.
-- Bible still requires has_paid, or a valid Colin invite (free_trial) through day 4.
-- The WhatsApp/Telegram view active_flows_filtered is not changed.
-- Existing leads are not deleted. Two email rows only gain an email_stop_token
-- (backup: supabase/content/email_leads_backup_20261104.json).

alter table public.leads
  add column if not exists email_unsubscribed_at timestamptz,
  add column if not exists email_stop_token text,
  add column if not exists email_last_sent_on date;

create unique index if not exists leads_email_stop_token_key
  on public.leads (email_stop_token)
  where email_stop_token is not null;

create or replace function public.lead_local_date(p_timezone text)
returns date
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
  return (now() at time zone v_tz)::date;
end;
$$;

revoke all on function public.lead_local_date(text) from public, anon, authenticated;

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

  if lower(btrim(coalesce(p_delivery_channel, ''))) = 'email' then
    update public.leads
       set email_stop_token = coalesce(email_stop_token, encode(extensions.gen_random_bytes(24), 'hex')),
           email_unsubscribed_at = null,
           current_mentoring_day = case
             when coalesce(current_mentoring_day, 0) > 0 then current_mentoring_day
             when exists (
               select 1 from public.flow_content
                where flow_name = v_flow_name and day_number = 0
             ) then 0
             else 1
           end
     where lower(email) = v_email;
  end if;
end;
$$;

update public.leads
   set email_stop_token = encode(extensions.gen_random_bytes(24), 'hex')
 where delivery_channel = 'email'
   and email_stop_token is null;

create or replace function public.stop_daily_email(p_token text)
returns boolean
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_email text;
begin
  if p_token is null or length(btrim(p_token)) < 32 then
    return false;
  end if;

  update public.leads
     set email_unsubscribed_at = coalesce(email_unsubscribed_at, now())
   where email_stop_token = btrim(p_token)
     and delivery_channel = 'email'
  returning email into v_email;

  if v_email is null then
    return false;
  end if;

  update public.active_flows
     set status = 'paused'
   where lead_email = v_email
     and status = 'active';

  return true;
end;
$$;

revoke all on function public.stop_daily_email(text) from public;
grant execute on function public.stop_daily_email(text) to anon, authenticated;

create or replace function public.claim_email_morning_batch(p_limit integer default 40, p_only_email text default null)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_only text := nullif(lower(btrim(coalesce(p_only_email, ''))), '');
  v_rows jsonb := '[]'::jsonb;
  r record;
  v_lang text;
  v_title text;
  v_text text;
  v_how text;
  v_why text;
  v_token text;
begin
  for r in
    select
      l.id,
      l.email,
      l.first_name,
      l.language,
      l.current_mentoring_day,
      l.last_sent_day,
      l.email_last_sent_on,
      l.email_stop_token,
      af.flow_name,
      fc.content_data,
      public.lead_local_date(coalesce(nullif(btrim(l.timezone), ''), l.onboarding_data->>'timezone')) as local_date
    from public.leads l
    join lateral (
      select f.flow_name
        from public.active_flows f
       where f.lead_email = l.email
         and f.status = 'active'
         and f.flow_name <> all (array['sleep_flow','morning_flow','stress_flow','clearstate_flow'])
         and f.flow_name !~~ 'fokus12\_%'
       order by f.id
       limit 1
    ) af on true
    join public.flow_content fc
      on fc.flow_name = af.flow_name
     and fc.day_number = l.current_mentoring_day
    where l.delivery_channel = 'email'
      and l.email_unsubscribed_at is null
      and l.current_mentoring_day is not null
      and l.email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      and (v_only is null or lower(l.email) = v_only)
      and public.lead_local_hour(coalesce(nullif(btrim(l.timezone), ''), l.onboarding_data->>'timezone')) = 7
      and (
        l.email_last_sent_on is null
        or l.email_last_sent_on < public.lead_local_date(coalesce(nullif(btrim(l.timezone), ''), l.onboarding_data->>'timezone'))
      )
      and (
        l.current_mentoring_day <= 4
        or (l.current_mentoring_day > 4 and coalesce(l.has_paid, false))
      )
      and (
        af.flow_name <> 'bible_flow'
        or coalesce(l.has_paid, false)
        or (coalesce(l.free_trial, false) and l.current_mentoring_day <= 4)
      )
    order by l.created_at
    limit 40
    for update of l skip locked
  loop
    v_lang := case when r.language in ('de', 'en', 'es') then r.language else 'en' end;
    v_title := coalesce(
      nullif(r.content_data #>> array['core', v_lang, 'title'], ''),
      r.content_data #>> array['core', 'en', 'title'],
      ''
    );
    v_text := coalesce(
      nullif(r.content_data #>> array['core', v_lang, 'text'], ''),
      r.content_data #>> array['core', 'en', 'text'],
      ''
    );
    v_how := coalesce(
      nullif(r.content_data #>> array['twists', 'body', v_lang, 'how'], ''),
      r.content_data #>> array['twists', 'body', 'en', 'how'],
      ''
    );
    v_why := coalesce(
      nullif(r.content_data #>> array['twists', 'body', v_lang, 'why'], ''),
      r.content_data #>> array['twists', 'body', 'en', 'why'],
      ''
    );
    if v_title = '' and v_text = '' then
      continue;
    end if;

    v_token := coalesce(r.email_stop_token, encode(extensions.gen_random_bytes(24), 'hex'));
    update public.leads
       set current_mentoring_day = r.current_mentoring_day + 1,
           last_sent_day = r.current_mentoring_day,
           email_last_sent_on = r.local_date,
           email_stop_token = v_token
     where id = r.id;

    v_rows := v_rows || jsonb_build_array(jsonb_build_object(
      'lead_id', r.id,
      'email', r.email,
      'first_name', coalesce(r.first_name, ''),
      'language', v_lang,
      'flow_name', r.flow_name,
      'sent_day', r.current_mentoring_day,
      'previous_day', r.current_mentoring_day,
      'previous_last_sent', r.last_sent_day,
      'previous_sent_on', r.email_last_sent_on,
      'stop_token', v_token,
      'title', v_title,
      'text', v_text,
      'how', v_how,
      'why', v_why
    ));
  end loop;

  return v_rows;
end;
$$;

revoke all on function public.claim_email_morning_batch(integer, text) from public, anon, authenticated;
grant execute on function public.claim_email_morning_batch(integer, text) to service_role;

create or replace function public.release_email_morning(
  p_lead_id uuid,
  p_previous_day integer,
  p_previous_last_sent integer,
  p_previous_sent_on date
) returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  update public.leads
     set current_mentoring_day = p_previous_day,
         last_sent_day = p_previous_last_sent,
         email_last_sent_on = p_previous_sent_on
   where id = p_lead_id
     and current_mentoring_day = p_previous_day + 1
     and last_sent_day is not distinct from p_previous_day;
end;
$$;

revoke all on function public.release_email_morning(uuid, integer, integer, date) from public, anon, authenticated;
grant execute on function public.release_email_morning(uuid, integer, integer, date) to service_role;

create or replace function public.email_cron_authorized(p_secret text)
returns boolean
language sql
security definer
set search_path to 'public', 'vault'
as $$
  select coalesce(p_secret, '') <> ''
     and exists (
       select 1
         from vault.decrypted_secrets
        where name = 'email_morning_cron'
          and decrypted_secret = p_secret
     );
$$;

revoke all on function public.email_cron_authorized(text) from public, anon, authenticated;
grant execute on function public.email_cron_authorized(text) to service_role;

create table if not exists public.email_morning_runs (
  id bigint generated always as identity primary key,
  source text not null default 'make',
  created_at timestamptz not null default now()
);

alter table public.email_morning_runs enable row level security;
revoke all on table public.email_morning_runs from anon, authenticated;
grant select, insert, delete on table public.email_morning_runs to service_role;
grant usage, select on sequence public.email_morning_runs_id_seq to service_role;

create or replace view public.email_morning_tick
with (security_invoker = true) as
select 1::integer as id;

grant select on public.email_morning_tick to anon, authenticated, service_role;

create or replace function public.kick_email_morning()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'net', 'vault'
as $$
declare
  v_secret text;
begin
  select decrypted_secret into v_secret
    from vault.decrypted_secrets
   where name = 'email_morning_cron'
   limit 1;

  if v_secret is not null and v_secret <> '' then
    perform net.http_post(
      url := 'https://jztwnumtwihomgxwlwor.supabase.co/functions/v1/send-morning-emails',
      body := '{}'::jsonb,
      params := '{}'::jsonb,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-cron-secret', v_secret
      ),
      timeout_milliseconds := 120000
    );
  end if;

  delete from public.email_morning_runs
   where created_at < now() - interval '7 days';

  return new;
exception
  when others then
    return new;
end;
$$;

revoke all on function public.kick_email_morning() from public, anon, authenticated;

drop trigger if exists email_morning_runs_kick on public.email_morning_runs;
create trigger email_morning_runs_kick
  after insert on public.email_morning_runs
  for each row
  execute function public.kick_email_morning();
