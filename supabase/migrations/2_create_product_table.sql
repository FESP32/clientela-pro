create table if not exists public.product (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null,                         -- FK added below
  name        text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- FK: product.business_id → business(id)
alter table public.product
  add constraint product_business_id_fk
  foreign key (business_id) references public.business(id)
  on delete cascade;

create index if not exists product_business_id_idx on public.product (business_id);
