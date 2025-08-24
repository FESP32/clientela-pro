-- Enable helpful extensions (safe if already enabled)
create extension if not exists pg_trgm;

-- Timestamp trigger for updated_at
create or replace function trigger_set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Main table
create table if not exists public.businesses (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references auth.users(id) on delete cascade,
  name              text not null,
  description       text,
  website_url       text,
  instagram_url     text,
  facebook_url      text,
  image_url         text,
  image_path        text,
  is_active         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Keep updated_at fresh
drop trigger if exists set_timestamp_on_businesses on public.businesses;
create trigger set_timestamp_on_businesses
before update on public.businesses
for each row execute function trigger_set_timestamp();

-- Indexes
create index if not exists businesses_owner_idx on public.businesses (owner_id);
create index if not exists businesses_active_idx on public.businesses (is_active);
-- (Optional, handy for dashboards)
create index if not exists businesses_owner_active_idx on public.businesses (owner_id, is_active);
