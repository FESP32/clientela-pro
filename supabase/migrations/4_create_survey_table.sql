-- Enable UUIDs for gen_random_uuid()
create extension if not exists pgcrypto;

create table public.survey (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null,   
  business_id  uuid not null,  
  title        text not null,
  description  text,
  traits       jsonb not null default '[]'::jsonb,
  is_anonymous boolean not null default false,
  is_active    boolean not null default true,
  starts_at    timestamptz,
  ends_at      timestamptz,
  settings     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- FKs
alter table public.survey
  add constraint survey_product_id_fk
  foreign key (product_id) references public.product(id)
  on delete cascade;

alter table public.survey
  add constraint survey_business_id_fk
  foreign key (business_id) references public.business(id)
  on delete cascade;

-- Helpful indexes for joins/filters
create index if not exists survey_product_id_idx  on public.survey (product_id);
create index if not exists survey_business_id_idx on public.survey (business_id);
