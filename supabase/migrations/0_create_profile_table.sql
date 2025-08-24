-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 2) Profiles table (extends Supabase auth.users)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  subscription_plan text check (subscription_plan in ('free', 'premium')) default 'free',
  user_type text not null default 'customer' check (user_type in ('merchant','customer')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 3) Auto-update updated_at on any change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();
