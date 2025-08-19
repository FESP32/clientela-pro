-- ==========================================================
-- Stamp Cards: first-time migration (clear naming)
-- Depends on:
--   - public.profiles(user_id)  -- creator & customer
--   - public.products(id)       -- product list
-- ==========================================================

-- 1) A stamp card a merchant creates (defines the goal and how many stamps are needed)
create table if not exists public.stamp_cards (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references public.profiles(user_id) on delete cascade,
  title            text not null,                 -- e.g., "Coffee Card"
  goal_text        text not null,                 -- e.g., "Free Coffee", "10% off"
  stamps_required  integer not null check (stamps_required >= 1),
  is_active        boolean not null default true,
  valid_from       timestamptz,
  valid_to         timestamptz,
  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz not null default timezone('utc', now())
);

create index if not exists idx_stamp_cards_owner  on public.stamp_cards(owner_id);
create index if not exists idx_stamp_cards_active on public.stamp_cards(is_active);

-- 2) Which products the card applies to (many-to-many: card ↔ products)
create table if not exists public.stamp_card_products (
  card_id     uuid not null references public.stamp_cards(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  primary key (card_id, product_id)
);

create index if not exists idx_stamp_card_products_product on public.stamp_card_products(product_id);

-- 3) A stamp (“punch”) earned by a customer for a specific card
--    One row = one stamping event; qty lets you add multiple stamps at once.
create table if not exists public.stamp_punches (
  id           uuid primary key default gen_random_uuid(),
  card_id      uuid not null references public.stamp_cards(id) on delete cascade,
  customer_id  uuid not null references public.profiles(user_id) on delete cascade,
  qty          integer not null default 1 check (qty >= 1),  -- number of stamps added in this event
  note         text,
  created_at   timestamptz not null default timezone('utc', now())
);

create index if not exists idx_stamp_punches_card           on public.stamp_punches(card_id);
create index if not exists idx_stamp_punches_customer       on public.stamp_punches(customer_id);
create index if not exists idx_stamp_punches_card_customer  on public.stamp_punches(card_id, customer_id);

-- ==========================================================
-- Stamp Intents: first-time migration
-- Depends on:
--   - public.stamp_cards(id)
--   - public.profiles(user_id)
-- ==========================================================

create table if not exists public.stamp_intents (
  id           uuid primary key default gen_random_uuid(),
  card_id      uuid not null references public.stamp_cards(id) on delete cascade,
  merchant_id  uuid not null references public.profiles(user_id) on delete cascade, -- merchant
  customer_id  uuid references public.profiles(user_id) on delete set null,         -- optional target
  qty          integer not null check (qty >= 1),                                   -- punches to grant
  status       text not null default 'pending'
               check (status in ('pending','consumed','canceled')),
  note         text,
  expires_at   timestamptz,
  consumed_at  timestamptz,                                                         -- set when used
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

-- Helpful indexes
create index if not exists idx_stamp_intents_card        on public.stamp_intents(card_id);
create index if not exists idx_stamp_intents_merchant    on public.stamp_intents(merchant_id);
create index if not exists idx_stamp_intents_customer    on public.stamp_intents(customer_id);
create index if not exists idx_stamp_intents_status      on public.stamp_intents(status);
create index if not exists idx_stamp_intents_expires_at  on public.stamp_intents(expires_at);

-- Touch updated_at on update
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end$$;

drop trigger if exists trig_touch_stamp_intents on public.stamp_intents;
create trigger trig_touch_stamp_intents
before update on public.stamp_intents
for each row execute procedure public.touch_updated_at();

