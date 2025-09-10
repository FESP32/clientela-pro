-- =========================================================
-- Subscriptions — adjust schema: interval → subscription, price → (price_month, price_year)
-- =========================================================

create extension if not exists pgcrypto;

-- Touch updated_at helper (reused)
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end$$;

-- ---------------------------------------------------------
-- subscription_plan (catalog) — ensure table, then adjust columns
-- ---------------------------------------------------------
create table if not exists public.subscription_plan (
  id            uuid primary key default gen_random_uuid(),
  code          text not null,
  name          text not null,
  description   text,
  price_month   numeric(12,2) not null default 0.00,
  price_year    numeric(12,2) not null default 0.00,
  currency      text not null default 'USD',
  is_active     boolean not null default true,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now())
);

-- If migrating from older version, add new columns if missing
alter table public.subscription_plan
  add column if not exists price_month numeric(12,2) not null default 0.00;

alter table public.subscription_plan
  add column if not exists price_year numeric(12,2) not null default 0.00;

-- Indexes (clean + idempotent)
create unique index if not exists subscription_plan_code_uq on public.subscription_plan (code);
create index if not exists subscription_plan_active_idx     on public.subscription_plan (is_active);

-- Keep updated_at fresh
drop trigger if exists trig_touch_subscription_plan on public.subscription_plan;
create trigger trig_touch_subscription_plan
before update on public.subscription_plan
for each row execute procedure public.touch_updated_at();

-- ---------------------------------------------------------
-- subscription (per-user) — ensure table, add interval column
-- ---------------------------------------------------------
create table if not exists public.subscription (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  plan_id       uuid not null,

  status        text not null default 'active' check (status in ('active', 'canceled')),
  started_at    timestamptz not null default timezone('utc', now()),
  expires_at    timestamptz,

  -- NEW: interval now lives here
  interval      text not null default 'month' check (interval in ('month','year')),

  created_at    timestamptz not null default timezone('utc', now()),
  updated_at    timestamptz not null default timezone('utc', now())
);

-- FKs (separate clauses; re-adding is idempotent if names match)
alter table public.subscription
  add constraint subscription_user_id_fk_profile
    foreign key (user_id) references public.profile(user_id)
    on delete cascade;

alter table public.subscription
  add constraint subscription_plan_id_fk
    foreign key (plan_id) references public.subscription_plan(id)
    on delete restrict;

-- Indexes
create index if not exists subscription_user_idx     on public.subscription (user_id);
create index if not exists subscription_plan_idx     on public.subscription (plan_id);
create index if not exists subscription_status_idx   on public.subscription (status);
create index if not exists subscription_interval_idx on public.subscription (interval);

-- One ACTIVE subscription per user (idempotent)
create unique index if not exists subscription_one_active_per_user
  on public.subscription (user_id)
  where (status = 'active' and expires_at is null);

-- Keep updated_at fresh
drop trigger if exists trig_touch_subscription on public.subscription;
create trigger trig_touch_subscription
before update on public.subscription
for each row execute procedure public.touch_updated_at();

-- ---------------------------------------------------------
-- Seed / upsert plans with month & year pricing
-- ---------------------------------------------------------
insert into public.subscription_plan (code, name, description, price_month, price_year, currency, is_active, metadata)
values
  ('free',        'Free',        'Basic features',                         0.00,   0.00, 'USD', true, '{}'::jsonb),
  ('growth',      'Growth',      'For small teams ready to scale',        29.00, 290.00, 'USD', true, '{}'::jsonb),
  ('growth_plus', 'Growth+',     'Advanced features for growing teams',   39.00, 390.00, 'USD', true, '{}'::jsonb),
  ('enterprise',  'Enterprise',  'Custom, enterprise-grade plan',          0.00,   0.00, 'USD', true, '{}'::jsonb)
on conflict (code) do update
set
  name         = excluded.name,
  description  = excluded.description,
  price_month  = excluded.price_month,
  price_year   = excluded.price_year,
  currency     = excluded.currency,
  is_active    = excluded.is_active,
  metadata     = excluded.metadata,
  updated_at   = timezone('utc', now());


-- ---------------------------------------------------------
-- Seed / upsert plans WITH metadata limits
-- ---------------------------------------------------------
-- NOTE: adjust numbers as you like; these are reasonable defaults.
insert into public.subscription_plan
  (code,         name,        description,                         price_month, price_year, currency, is_active, metadata)
values
  ('free',       'Free',      'Basic features',                         0.00,      0.00,    'USD',    true,
    jsonb_build_object(
      'max_businesses',        1,
      'max_products',          3,
      'max_surveys',           5,
      'max_referral_programs', 1,
      'max_gifts',             1,
      'max_stamps',            1
    )
  ),
  ('growth',     'Growth',    'For small teams ready to scale',       29.00,    290.00,    'USD',    true,
    jsonb_build_object(
      'max_businesses',        1,
      'max_products',          25,
      'max_surveys',           15,
      'max_referral_programs', 3,
      'max_gifts',             5,
      'max_stamps',            10
    )
  ),
  ('growth_plus','Growth+',   'Advanced features for growing teams',  79.00,    790.00,    'USD',    true,
    jsonb_build_object(
      'max_businesses',        3,
      'max_products',          50,
      'max_surveys',           250,
      'max_referral_programs', 10,
      'max_gifts',             100,
      'max_stamps',            50
    )
  ),
  ('enterprise', 'Enterprise','Custom, enterprise-grade plan',         0.00,      0.00,    'USD',    true,
    jsonb_build_object(
      'max_businesses',        100,
      'max_products',          10000,
      'max_surveys',           1000,
      'max_referral_programs', 100,
      'max_gifts',             1000,
      'max_stamps',            1000
    )
  )
on conflict (code) do update
set
  name         = excluded.name,
  description  = excluded.description,
  price_month  = excluded.price_month,
  price_year   = excluded.price_year,
  currency     = excluded.currency,
  is_active    = excluded.is_active,
  metadata     = excluded.metadata,
  updated_at   = timezone('utc', now());