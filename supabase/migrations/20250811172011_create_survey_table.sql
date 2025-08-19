-- Enable UUIDs for gen_random_uuid()
create extension if not exists pgcrypto;

create table public.surveys (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade,
  product_id   uuid not null references public.products (id) on delete cascade,

  title        text not null,
  description  text,

  -- Example value for traits:
  -- [
  --   {"label":"too sweet","sentiment":"negative"},
  --   {"label":"very pleasant","sentiment":"positive"}
  -- ]
  traits       jsonb not null default '[]'::jsonb,

  -- When true, responses to this survey are intended to be anonymous.
  -- App/DB logic can use this to avoid storing respondent identifiers
  -- (e.g., NULL respondent_id) and to limit visibility accordingly.
  is_anonymous boolean not null default false,

  is_active    boolean not null default true,
  starts_at    timestamptz,
  ends_at      timestamptz,

  -- Example settings:
  --   {"require_auth": true}
  settings     jsonb not null default '{}'::jsonb,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
