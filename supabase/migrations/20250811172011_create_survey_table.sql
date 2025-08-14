create table public.surveys (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users (id) on delete cascade,
  product_id   uuid not null references public.products (id) on delete cascade,
  title        text not null,
  description  text,
  -- Example value:
  -- [
  --   {"label":"too sweet","sentiment":"negative"},
  --   {"label":"very pleasant","sentiment":"positive"}
  -- ]
  traits       jsonb not null default '[]'::jsonb,
  is_active    boolean not null default true,
  starts_at    timestamptz,
  ends_at      timestamptz,
  settings     jsonb not null default '{}'::jsonb,      -- e.g. {"require_auth": true}
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
