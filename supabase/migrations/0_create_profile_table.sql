-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profile (
  user_id uuid not null,
  name text,
  subscription_plan text check (subscription_plan in ('free', 'premium')) default 'free',
  user_type text not null default 'customer' check (user_type in ('merchant','customer')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint profile_pkey primary key (user_id)
);

-- Create the FK separately (shared-primary-key 1:1)
alter table public.profile
  add constraint profile_user_id_fk_auth_users
  foreign key (user_id) references auth.users(id)
  on delete cascade;

-- Auto-update updated_at on any change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
before update on public.profile
for each row
execute procedure public.set_updated_at();
