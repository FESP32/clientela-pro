-- 1) A stamp card a merchant creates (defines the goal and how many stamps are needed)
create table if not exists public.stamp_card (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null,  -- FK added below
  title            text not null,                 -- e.g., "Coffee Card"
  goal_text        text not null,                 -- e.g., "Free Coffee", "10% off"
  stamps_required  integer not null check (stamps_required >= 1),
  is_active        boolean not null default true,
  valid_from       timestamptz,
  valid_to         timestamptz,
  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz not null default timezone('utc', now())
);

-- FK
alter table public.stamp_card
  add constraint stamp_card_business_id_fk
  foreign key (business_id) references public.business(id)
  on delete cascade;

create index if not exists idx_stamp_business_id   on public.stamp_card(business_id);
create index if not exists idx_stamp_card_active   on public.stamp_card(is_active);

-- 2) Which products the card applies to (many-to-many: card ↔ products)
create table if not exists public.stamp_card_product (
  card_id     uuid not null,  -- FKs added below
  product_id  uuid not null,
  primary key (card_id, product_id)
);

-- FKs
alter table public.stamp_card_product
  add constraint stamp_card_product_card_id_fk
  foreign key (card_id) references public.stamp_card(id)
  on delete cascade;

alter table public.stamp_card_product
  add constraint stamp_card_product_product_id_fk
  foreign key (product_id) references public.product(id)
  on delete cascade;

create index if not exists idx_stamp_card_products_product on public.stamp_card_product(product_id);

-- 3) A stamp (“punch”) earned by a customer for a specific card
--    One row = one stamping event; qty lets you add multiple stamps at once.
create table if not exists public.stamp_punch (
  id           uuid primary key default gen_random_uuid(),
  card_id      uuid not null,  -- FKs added below
  customer_id  uuid not null,
  qty          integer not null default 1 check (qty >= 1),  -- number of stamps added in this event
  note         text,
  created_at   timestamptz not null default timezone('utc', now())
);

-- FKs
alter table public.stamp_punch
  add constraint stamp_punch_card_id_fk
  foreign key (card_id) references public.stamp_card(id)
  on delete cascade;

alter table public.stamp_punch
  add constraint stamp_punch_customer_id_fk_profile
  foreign key (customer_id) references public.profile(user_id)
  on delete cascade;

create index if not exists idx_stamp_punch_card           on public.stamp_punch(card_id);
create index if not exists idx_stamp_punch_customer       on public.stamp_punch(customer_id);
create index if not exists idx_stamp_punch_card_customer  on public.stamp_punch(card_id, customer_id);

-- ==========================================================
-- Stamp Intents: first-time migration
-- Depends on:
--   - public.stamp_card(id)
--   - public.profile(user_id)
-- ==========================================================

create table if not exists public.stamp_intent (
  id           uuid primary key default gen_random_uuid(),
  card_id      uuid not null,  -- FKs added below
  business_id  uuid not null,
  customer_id  uuid,           -- optional target; FK added below
  qty          integer not null check (qty >= 1),                                   -- punches to grant
  status       text not null default 'pending'
               check (status in ('pending','consumed','canceled')),
  note         text,
  expires_at   timestamptz,
  consumed_at  timestamptz,                                                         -- set when used
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

-- Explicit FKs
alter table public.stamp_intent
  add constraint stamp_intent_card_id_fk
  foreign key (card_id) references public.stamp_card(id)
  on delete cascade;

alter table public.stamp_intent
  add constraint stamp_intent_business_id_fk
  foreign key (business_id) references public.business(id)
  on delete cascade;

alter table public.stamp_intent
  add constraint stamp_intent_customer_id_fk_profile
  foreign key (customer_id) references public.profile(user_id)
  on delete set null;

-- Helpful indexes
create index if not exists idx_stamp_intent_card        on public.stamp_intent(card_id);
create index if not exists idx_stamp_intent_customer    on public.stamp_intent(customer_id);
create index if not exists idx_stamp_intent_status      on public.stamp_intent(status);
create index if not exists idx_stamp_intent_expires_at  on public.stamp_intent(expires_at);

-- Touch updated_at on update
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end$$;

drop trigger if exists trig_touch_stamp_intent on public.stamp_intent;
create trigger trig_touch_stamp_intent
before update on public.stamp_intent
for each row execute procedure public.touch_updated_at();
