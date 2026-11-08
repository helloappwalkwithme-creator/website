-- Stripe orders for new men/women text offers. Service role only.
-- Does not alter leads, Digistore flags, or has_paid.

create table if not exists public.stripe_ereignisse (
  event_id text primary key,
  typ text not null,
  empfangen_am timestamptz not null default now()
);

create table if not exists public.stripe_bestellungen (
  id uuid primary key,
  anfrage_id text unique,
  angebot_id text not null,
  thema text,
  email text,
  preis_id text,
  betrag integer,
  waehrung text,
  modus text,
  status text not null,
  session_id text unique,
  session_url text,
  customer_id text,
  subscription_id text,
  payment_intent_id text,
  access_code text unique,
  zugang boolean not null default false,
  access_until timestamptz,
  utm jsonb not null default '{}'::jsonb,
  aktualisiert_am timestamptz not null default now()
);

alter table public.stripe_bestellungen add column if not exists betrag integer;
alter table public.stripe_bestellungen add column if not exists waehrung text;

alter table public.stripe_ereignisse enable row level security;
alter table public.stripe_bestellungen enable row level security;

revoke all on table public.stripe_ereignisse from public, anon, authenticated;
revoke all on table public.stripe_bestellungen from public, anon, authenticated;
