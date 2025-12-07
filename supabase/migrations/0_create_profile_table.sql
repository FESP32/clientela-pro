 create extension if not exists "uuid-ossp";

create table if not exists public.profile (
  user_id uuid not null,
  name text,
  user_type text not null default 'customer' check (user_type in ('merchant','customer')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint profile_pkey primary key (user_id)
);

alter table public.profile
  drop constraint if exists profile_user_id_fk_auth_users,
  add constraint profile_user_id_fk_auth_users
  foreign key (user_id) references auth.users(id)
  on delete cascade;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------
-- SAFE HELPERS for RLS
-- ---------------------------------------------------------
create or replace function public.is_user_customer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profile p
    where p.user_id = auth.uid()
      and p.user_type = 'customer'
  );
$$;

create or replace function public.is_user_merchant()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profile p
    where p.user_id = auth.uid()
      and p.user_type = 'merchant'
  );
$$;

-- Lock down execution (avoid PUBLIC)
revoke all on function public.is_user_customer() from public;
revoke all on function public.is_user_merchant() from public;
grant execute on function public.is_user_customer() to authenticated;
grant execute on function public.is_user_merchant() to authenticated;
-- (Grant to anon as well if you will call these in anon policies)

-- -----------------------------
-- RLS + Policies
-- -----------------------------

-- Enable RLS (deny-by-default)
alter table public.profile enable row level security;

-- Optional hardening:
-- alter table public.profile force row level security;

-- Clean up any old policies
drop policy if exists profile_select_self on public.profile;
drop policy if exists profile_insert_self on public.profile;
drop policy if exists profile_update_self on public.profile;
drop policy if exists profile_delete_self on public.profile;
drop policy if exists profile_select_merchants_read_customers on public.profile;

-- users can read their own profile
create policy profile_select_self
on public.profile
for select
to authenticated
using ( user_id = auth.uid() );

-- merchants can read ONLY customer profiles
create policy profile_select_merchants_read_customers
on public.profile
for select
to authenticated
using (
  public.is_user_merchant() 
  and user_type = 'customer'
);

-- users can create their own profile row
create policy profile_insert_self
on public.profile
for insert
to authenticated
with check ( user_id = auth.uid() );

-- users can update only their own profile row
create policy profile_update_self
on public.profile
for update
to authenticated
using ( user_id = auth.uid() )
with check ( user_id = auth.uid() );

-- users can delete only their own profile row
create policy profile_delete_self
on public.profile
for delete
to authenticated
using ( user_id = auth.uid() );
