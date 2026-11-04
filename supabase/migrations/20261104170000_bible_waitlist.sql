-- Public Bible quiz, while Digistore checkout has no product id.
-- Stores a lead with signup_status = 'waitlist'.
-- Does not create an active flow, so no morning message is sent.
-- Does not change free_trial or has_paid on an existing lead.

alter table public.leads add column if not exists signup_status text;

create or replace function public.register_bible_waitlist(
  p_email text,
  p_first_name text,
  p_language text,
  p_onboarding_data jsonb
) returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_email text;
  v_name text;
begin
  v_email := lower(btrim(coalesce(p_email, '')));
  v_name := btrim(coalesce(p_first_name, ''));
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;
  if v_name = '' then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if coalesce(p_onboarding_data->>'waitlist_consent', '') <> 'true' then
    raise exception 'consent_required' using errcode = '42501';
  end if;

  insert into public.leads (
    email, first_name, language, source, chosen_path,
    delivery_channel, onboarding_data, signup_status, free_trial, marketing_consent
  )
  values (
    v_email, v_name, nullif(btrim(coalesce(p_language, '')), ''), 'bible_waitlist', 'bible',
    null, coalesce(p_onboarding_data, '{}'::jsonb), 'waitlist', false, true
  )
  on conflict ((lower(email))) do update set
    first_name = excluded.first_name,
    language = excluded.language,
    signup_status = 'waitlist',
    onboarding_data = excluded.onboarding_data,
    marketing_consent = coalesce(public.leads.marketing_consent, false) or true;
end;
$$;

revoke all on function public.register_bible_waitlist(text, text, text, jsonb) from public;
grant execute on function public.register_bible_waitlist(text, text, text, jsonb) to anon, authenticated;
