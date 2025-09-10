-- =========================
-- product
-- =========================
create table if not exists public.product (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  name        text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- FK: product.business_id → business(id)
alter table public.product
  drop constraint if exists product_business_id_fk,
  add constraint product_business_id_fk
    foreign key (business_id) references public.business(id)
    on delete cascade;

-- Keep updated_at fresh
drop trigger if exists set_timestamp_on_product on public.product;
create trigger set_timestamp_on_product
before update on public.product
for each row execute function trigger_set_timestamp();

-- Helpful index
create index if not exists product_business_id_idx on public.product (business_id);

-- =========================
-- Row Level Security
-- =========================
alter table public.product enable row level security;
-- Optional:
-- alter table public.product force row level security;

-- Clean old policies if any
drop policy if exists product_select on public.product;
drop policy if exists product_cud on public.product;
drop policy if exists product_insert on public.product;
drop policy if exists product_update on public.product;
drop policy if exists product_delete on public.product;

-- SELECT: business members OR business owner can read products
create policy product_select
on public.product
for select
to authenticated
using (
  public.is_business_member(business_id)
  or exists (
    select 1 from public.business b
    where b.id = public.product.business_id
      and b.owner_id = auth.uid()
  )
);

-- CUD: business members OR business owner can create/update/delete products
-- (Single ALL policy keeps it simple; split if you need different rules per verb.)
create policy product_cud
on public.product
for all
to authenticated
using (
  public.is_business_member(business_id)
  or exists (
    select 1 from public.business b
    where b.id = public.product.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  public.is_business_member(business_id)
  or exists (
    select 1 from public.business b
    where b.id = public.product.business_id
      and b.owner_id = auth.uid()
  )
);
