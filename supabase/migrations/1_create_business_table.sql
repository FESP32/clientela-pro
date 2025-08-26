-- Enable helpful extensions (safe if already enabled)
create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

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

-- =========================
-- business
-- =========================
create table if not exists public.business (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null,                              -- FK added below
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

-- FK: business.owner_id → profile(user_id)
alter table public.business
  add constraint business_owner_id_fk_profile
  foreign key (owner_id) references public.profile(user_id)
  on delete cascade;

-- Keep updated_at fresh
drop trigger if exists set_timestamp_on_business on public.business;
create trigger set_timestamp_on_business
before update on public.business
for each row execute function trigger_set_timestamp();

-- Indexes
create index if not exists business_owner_idx on public.business (owner_id);
create index if not exists business_active_idx on public.business (is_active);
create index if not exists business_owner_active_idx on public.business (owner_id, is_active);

-- =========================
-- business_user (M:N)
-- =========================
create table if not exists public.business_user (
  business_id uuid not null,                                   
  user_id     uuid not null,
  role        text not null default 'member' check (role in ('owner','admin','member')),
  created_at  timestamptz not null default timezone('utc', now()),
  primary key (business_id, user_id)
);

-- FKs for junction table
alter table public.business_user
  add constraint business_user_business_id_fk
  foreign key (business_id) references public.business(id)
  on delete cascade;

alter table public.business_user
  add constraint business_user_user_id_fk_profile
  foreign key (user_id) references public.profile(user_id)
  on delete cascade;

-- Helpful single-column indexes (optional but good for filters)
create index if not exists business_user_business_id_idx on public.business_user (business_id);
create index if not exists business_user_user_id_idx     on public.business_user (user_id);

-- =========================
-- business_active
-- =========================
create table if not exists public.business_active (
  user_id     uuid primary key,
  business_id uuid not null,
  set_at      timestamptz not null default timezone('utc', now())
);

-- FKs
alter table public.business_active
  add constraint business_active_user_id_fk_profile
  foreign key (user_id) references public.profile(user_id)
  on delete cascade;

alter table public.business_active
  add constraint business_active_business_id_fk
  foreign key (business_id) references public.business(id)
  on delete cascade;

-- =========================
-- business_invite
-- =========================
create table if not exists public.business_invite (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null,                                    
  invited_by   uuid,                                             
  invited_user uuid,                                             
  email        text,
  role text not null default 'member'
  check (role in ('admin','member')),
  status       text not null default 'pending'
                check (status in ('pending','accepted','canceled')),
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

-- FKs with explicit names
alter table public.business_invite
  add constraint business_invite_business_id_fk
  foreign key (business_id) references public.business(id)
  on delete cascade;

alter table public.business_invite
  add constraint business_invite_invited_by_fk_profile
  foreign key (invited_by) references public.profile(user_id)
  on delete set null;

alter table public.business_invite
  add constraint business_invite_invited_user_fk_profile
  foreign key (invited_user) references public.profile(user_id)
  on delete set null;

-- Keep updated_at fresh
drop trigger if exists set_timestamp_on_business_invite on public.business_invite;
create trigger set_timestamp_on_business_invite
before update on public.business_invite
for each row execute function trigger_set_timestamp();

-- Indexes to speed up queries
create index if not exists business_invites_business_idx      on public.business_invite (business_id);
create index if not exists business_invites_invited_user_idx  on public.business_invite (invited_user);
create index if not exists business_invites_status_idx        on public.business_invite (status);
