-- =========================================================
-- Extensions (safe if already enabled)
-- =========================================================
create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;  -- for gen_random_uuid()

-- =========================================================
-- Timestamp trigger for updated_at
-- =========================================================
create or replace function trigger_set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- Tables
-- =========================================================

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
  drop constraint if exists business_owner_id_fk_profile,
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
  drop constraint if exists business_user_business_id_fk,
  add constraint business_user_business_id_fk
    foreign key (business_id) references public.business(id)
    on delete cascade;

alter table public.business_user
  drop constraint if exists business_user_user_id_fk_profile,
  add constraint business_user_user_id_fk_profile
    foreign key (user_id) references public.profile(user_id)
    on delete cascade;

-- Helpful single-column indexes
create index if not exists business_user_business_id_idx on public.business_user (business_id);
create index if not exists business_user_user_id_idx     on public.business_user (user_id);

-- =========================
-- business_current
-- =========================
create table if not exists public.business_current (
  user_id     uuid primary key,
  business_id uuid not null,
  set_at      timestamptz not null default timezone('utc', now())
);

-- FKs
alter table public.business_current
  drop constraint if exists business_current_user_id_fk_profile,
  add constraint business_current_user_id_fk_profile
    foreign key (user_id) references public.profile(user_id)
    on delete cascade;

alter table public.business_current
  drop constraint if exists business_current_business_id_fk,
  add constraint business_current_business_id_fk
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
  role         text not null default 'member'
                 check (role in ('admin','member')),
  status       text not null default 'pending'
                 check (status in ('pending','accepted','canceled')),
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

-- FKs with explicit names
alter table public.business_invite
  drop constraint if exists business_invite_business_id_fk,
  add constraint business_invite_business_id_fk
    foreign key (business_id) references public.business(id)
    on delete cascade;

alter table public.business_invite
  drop constraint if exists business_invite_invited_by_fk_profile,
  add constraint business_invite_invited_by_fk_profile
    foreign key (invited_by) references public.profile(user_id)
    on delete set null;

alter table public.business_invite
  drop constraint if exists business_invite_invited_user_fk_profile,
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

-- =========================================================
-- Helper functions for RLS  (SECURITY DEFINER to break RLS recursion)
-- =========================================================
-- These helpers run with the function owner's privileges (table owner),
-- bypassing RLS inside the function body. Lock search_path for safety.

create or replace function public.is_business_member(biz_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_user bu
    where bu.business_id = biz_id
      and bu.user_id = auth.uid()
  );
$$;

create or replace function public.is_business_owner(biz_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business b
    where b.id = biz_id
      and b.owner_id = auth.uid()
  );
$$;

-- NEW: identify customers (profile.user_type = 'customer')
create or replace function public.is_user_customer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profile p
    where p.user_id = auth.uid()
      and p.user_type = 'customer'
  );
$$;

-- Tighten who can execute these helpers (avoid PUBLIC)
revoke all on function public.is_business_member(uuid) from public;
revoke all on function public.is_business_owner(uuid)  from public;
revoke all on function public.is_user_customer()       from public;

grant execute on function public.is_business_member(uuid) to authenticated;
grant execute on function public.is_business_owner(uuid)  to authenticated;
grant execute on function public.is_user_customer()       to authenticated;
-- (Add: grant to anon if you ever call these from anon policies)

-- =========================================================
-- Enable Row Level Security
-- =========================================================
alter table public.business          enable row level security;
alter table public.business_user     enable row level security;
alter table public.business_current  enable row level security;
alter table public.business_invite   enable row level security;
-- Optional hardening:
-- alter table public.business          force row level security;
-- alter table public.business_user     force row level security;
-- alter table public.business_current  force row level security;
-- alter table public.business_invite   force row level security;

-- =========================================================
-- POLICIES
-- =========================================================

-- ---------- business ----------
drop policy if exists biz_select on public.business;
drop policy if exists biz_select_customer_active on public.business; -- NEW drop guard
drop policy if exists biz_insert on public.business;
drop policy if exists biz_update on public.business;
drop policy if exists biz_delete on public.business;

-- Members (or owner) can read the business
-- (is_business_member()/owner are SECDEF now, so no RLS recursion)
create policy biz_select
on public.business
for select
to authenticated
using (
  public.is_business_member(id)
  or owner_id = auth.uid()
);

-- NEW: Customers can read ACTIVE businesses
create policy biz_select_customer_active
on public.business
for select
to authenticated
using (
  public.is_user_customer()
  and is_active = true
);

-- Only the signed-in user can create a business they own
create policy biz_insert
on public.business
for insert
to authenticated
with check ( owner_id = auth.uid() );

-- Only the owner can update/delete their business
create policy biz_update
on public.business
for update
to authenticated
using ( owner_id = auth.uid() )
with check ( owner_id = auth.uid() );

create policy biz_delete
on public.business
for delete
to authenticated
using ( owner_id = auth.uid() );

-- ---------- business_user ----------
drop policy if exists bu_select_self on public.business_user;
drop policy if exists bu_select_owner on public.business_user;
drop policy if exists bu_insert on public.business_user;
drop policy if exists bu_update on public.business_user;
drop policy if exists bu_delete on public.business_user;

-- Users can read their own membership rows
create policy bu_select_self
on public.business_user
for select
to authenticated
using ( user_id = auth.uid() );

-- Owners can read all membership rows for their business
create policy bu_select_owner
on public.business_user
for select
to authenticated
using (
  exists (
    select 1
    from public.business b
    where b.id = business_user.business_id
      and b.owner_id = auth.uid()
  )
);

-- Insert membership rows: only the business owner
create policy bu_insert
on public.business_user
for insert
to authenticated
with check (
  exists (
    select 1 from public.business b
    where b.id = business_user.business_id
      and b.owner_id = auth.uid()
  )
);

-- Update membership rows: only the business owner
create policy bu_update
on public.business_user
for update
to authenticated
using (
  exists (
    select 1 from public.business b
    where b.id = business_user.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.business b
    where b.id = business_user.business_id
      and b.owner_id = auth.uid()
  )
);

-- Delete membership rows: owner can remove anyone; a user may remove self (leave)
create policy bu_delete
on public.business_user
for delete
to authenticated
using (
  (exists (
    select 1 from public.business b
    where b.id = public.business_user.business_id
      and b.owner_id = auth.uid()
  ))
  or user_id = auth.uid()
);

-- ---------- business_current ----------
drop policy if exists bact_select on public.business_current;
drop policy if exists bact_insert on public.business_current;
drop policy if exists bact_update on public.business_current;
drop policy if exists bact_delete on public.business_current;

-- Users can read/create/update/delete only their own active-business row
create policy bact_select
on public.business_current
for select
to authenticated
using ( user_id = auth.uid() );

create policy bact_insert
on public.business_current
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_business_member(business_id)
);

create policy bact_update
on public.business_current
for update
to authenticated
using ( user_id = auth.uid() )
with check (
  user_id = auth.uid()
  and public.is_business_member(business_id)
);

create policy bact_delete
on public.business_current
for delete
to authenticated
using ( user_id = auth.uid() );

-- ---------- business_invite ----------
drop policy if exists binvite_select on public.business_invite;
drop policy if exists binvite_insert on public.business_invite;
drop policy if exists binvite_update on public.business_invite;
drop policy if exists binvite_delete on public.business_invite;

-- Members of the business (any role) can see invites;
-- invited_user and invited_by can also see theirs.
create policy binvite_select
on public.business_invite
for select
to authenticated
using (
  public.is_business_member(business_id)
  or invited_user = auth.uid()
  or invited_by = auth.uid()
);

-- Only business owner can create invites
create policy binvite_insert
on public.business_invite
for insert
to authenticated
with check (
  public.is_business_owner(business_id)
);

-- Owner or invited_user can update an invite (e.g., accept/cancel)
create policy binvite_update
on public.business_invite
for update
to authenticated
using (
  public.is_business_owner(business_id)
  or invited_user = auth.uid()
)
with check (
  public.is_business_owner(business_id)
  or invited_user = auth.uid()
);

-- Only the owner can delete invites
create policy binvite_delete
on public.business_invite
for delete
to authenticated
using ( public.is_business_owner(business_id) );
