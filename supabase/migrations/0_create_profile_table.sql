-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profile (
  user_id uuid not null,
  name text,
  subscription_plan text check (subscription_plan in ('free', 'premium')) default 'free',
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

do $$
begin
  if exists (
    select 1 from pg_trigger
    where tgname = 'set_profiles_updated_at'
  ) then
    drop trigger set_profiles_updated_at on public.profile;
  end if;
end$$;

create trigger set_profiles_updated_at
before update on public.profile
for each row
execute procedure public.set_updated_at();

-- ---------------------------------------------------------
-- SAFE HELPERS for RLS (SECURITY DEFINER to avoid recursion)
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
-- Row Level Security + Policies
-- -----------------------------

-- Enable RLS (deny-by-default)
alter table public.profile enable row level security;
-- Optional hardening:
-- alter table public.profile force row level security;

-- Clean up any old policies (safe if they don't exist)
drop policy if exists profile_select_self on public.profile;
drop policy if exists profile_insert_self on public.profile;
drop policy if exists profile_update_self on public.profile;
drop policy if exists profile_delete_self on public.profile;
drop policy if exists profile_select_merchants_read_customers on public.profile;

-- SELECT: users can read their own profile
create policy profile_select_self
on public.profile
for select
to authenticated
using ( user_id = auth.uid() );

-- NEW: merchants can read ONLY customer profiles (not other merchants)
create policy profile_select_merchants_read_customers
on public.profile
for select
to authenticated
using (
  public.is_user_merchant() 
  and user_type = 'customer'
);

-- INSERT: users can create their own profile row
create policy profile_insert_self
on public.profile
for insert
to authenticated
with check ( user_id = auth.uid() );

-- UPDATE: users can update only their own profile row
create policy profile_update_self
on public.profile
for update
to authenticated
using ( user_id = auth.uid() )
with check ( user_id = auth.uid() );

-- DELETE: users can delete only their own profile row
create policy profile_delete_self
on public.profile
for delete
to authenticated
using ( user_id = auth.uid() );
