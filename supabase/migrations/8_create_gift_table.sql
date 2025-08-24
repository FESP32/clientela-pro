-- Create table: gift
create table if not exists public.gift (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for faster lookups
create index if not exists idx_gift_owner_id on public.gift(owner_id);
create index if not exists idx_gift_customer_id on public.gift(customer_id);
