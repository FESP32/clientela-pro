-- =========================================================
-- GIFTS — Tables + RLS + Policies (fresh migration)
-- =========================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- Helper to auto-update updated_at
-- ---------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end$$;

-- =========================
-- Gift
-- =========================
create table public.gift (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null,     -- FK added below
  title        text not null,
  description  text,
  image_url    text,
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

-- FK: gift.business_id → business(id)
alter table public.gift
  add constraint gift_business_id_fk
    foreign key (business_id) references public.business(id)
    on delete cascade;

-- Index + trigger
create index idx_gift_business_id on public.gift(business_id);

create trigger trig_touch_gift
before update on public.gift
for each row execute procedure public.touch_updated_at();

-- =========================
-- Gift Intents
-- =========================
create table public.gift_intent (
  id           uuid primary key default gen_random_uuid(),
  gift_id      uuid not null,     -- FK added below
  business_id  uuid not null,     -- FK added below
  customer_id  uuid,              -- FK added below (nullable until claimed)

  status       text not null default 'pending'
               check (status in ('pending','consumed','canceled','claimed')),
  expires_at   timestamptz,
  consumed_at  timestamptz,

  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

-- FKs (separate clauses)
alter table public.gift_intent
  add constraint gift_intent_gift_id_fk
    foreign key (gift_id) references public.gift(id)
    on delete cascade;

alter table public.gift_intent
  add constraint gift_intent_business_id_fk
    foreign key (business_id) references public.business(id)
    on delete cascade;

alter table public.gift_intent
  add constraint gift_intent_customer_id_fk_profile
    foreign key (customer_id) references public.profile(user_id)
    on delete set null;

-- Indexes
create index idx_gift_intent_gift      on public.gift_intent(gift_id);
create index idx_gift_intent_business  on public.gift_intent(business_id);
create index idx_gift_intent_customer  on public.gift_intent(customer_id);
create index idx_gift_intent_status    on public.gift_intent(status);
create index idx_gift_intent_expires   on public.gift_intent(expires_at);

-- Auto-set consumed_at when status → 'consumed'
create or replace function public.gift_intent_set_consumed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'consumed' and (old.status is distinct from new.status) then
    new.consumed_at := timezone('utc', now());
  end if;
  return new;
end$$;

create trigger trig_set_consumed_at_gift_intent
before update on public.gift_intent
for each row execute procedure public.gift_intent_set_consumed_at();

create trigger trig_touch_gift_intent
before update on public.gift_intent
for each row execute procedure public.touch_updated_at();

-- =========================================================
-- Enable Row Level Security
-- =========================================================
alter table public.gift        enable row level security;
alter table public.gift_intent enable row level security;

-- =========================================================
-- POLICIES
-- Requires helper fns (recommended SECURITY DEFINER):
--   public.is_business_member(uuid), public.is_business_owner(uuid),
--   public.is_user_customer(), public.is_user_merchant()
-- =========================================================

-- ------------------------
-- gift (catalog entries)
-- ------------------------

-- Merchant READ: members/owners see their business gifts
create policy gift_select_merchant
on public.gift
for select
to authenticated
using (
  public.is_business_member(business_id)
  or public.is_business_owner(business_id)
);

-- Customer READ: customers see gifts where business is active
create policy gift_select_customer
on public.gift
for select
to authenticated
using (
  public.is_user_customer()
  and exists (
    select 1 from public.business b
    where b.id = public.gift.business_id
      and b.is_active = true
  )
);

-- Merchant C/U/D: manage gifts for their business
create policy gift_cud_merchant
on public.gift
for all  -- INSERT, UPDATE, DELETE
to authenticated
using (
  public.is_user_merchant()
  and (public.is_business_member(business_id) or public.is_business_owner(business_id))
)
with check (
  public.is_user_merchant()
  and (public.is_business_member(business_id) or public.is_business_owner(business_id))
);

-- ------------------------
-- gift_intent (claims)
-- ------------------------

-- Merchant READ: see intents for their business (gift↔business integrity)
create policy gift_intent_select_merchant
on public.gift_intent
for select
to authenticated
using (
  (public.is_business_member(business_id) or public.is_business_owner(business_id))
  and exists (
    select 1 from public.gift g
    where g.id = public.gift_intent.gift_id
      and g.business_id = public.gift_intent.business_id
  )
);

-- Merchant INSERT: create intents tied to a gift in same business
create policy gift_intent_insert_merchant
on public.gift_intent
for insert
to authenticated
with check (
  (public.is_business_member(business_id) or public.is_business_owner(business_id))
  and exists (
    select 1 from public.gift g
    where g.id = public.gift_intent.gift_id
      and g.business_id = public.gift_intent.business_id
  )
);

-- Merchant UPDATE: modify intents in their business
create policy gift_intent_update_merchant
on public.gift_intent
for update
to authenticated
using (
  (public.is_business_member(business_id) or public.is_business_owner(business_id))
  and exists (
    select 1 from public.gift g
    where g.id = public.gift_intent.gift_id
      and g.business_id = public.gift_intent.business_id
  )
)
with check (
  (public.is_business_member(business_id) or public.is_business_owner(business_id))
  and exists (
    select 1 from public.gift g
    where g.id = public.gift_intent.gift_id
      and g.business_id = public.gift_intent.business_id
  )
);

-- Merchant DELETE: delete intents in their business
create policy gift_intent_delete_merchant
on public.gift_intent
for delete
to authenticated
using (
  (public.is_business_member(business_id) or public.is_business_owner(business_id))
  and exists (
    select 1 from public.gift g
    where g.id = public.gift_intent.gift_id
      and g.business_id = public.gift_intent.business_id
  )
);

-- Customer READ: customers can read ANY pending intent (assigned or not)
--                and read their OWN claimed intents.
create policy gift_intent_select_customer_pending_claimed
on public.gift_intent
for select
to authenticated
using (
  public.is_user_customer()
);

-- Customer UPDATE: claim/update unassigned pending intent (assign to self; optional consume/cancel)
-- OLD row must be: pending, unassigned, not expired
-- NEW row must: set customer_id = auth.uid() and status in ('pending','consumed','canceled')
create policy gift_intent_update_customer_claim
on public.gift_intent
for update
to authenticated
using (
  public.is_user_customer()
  and public.gift_intent.status = 'pending'
  and public.gift_intent.customer_id is null
  and (public.gift_intent.expires_at is null
       or public.gift_intent.expires_at >= timezone('utc', now()))
)
with check (
  public.gift_intent.customer_id = auth.uid()
  and public.gift_intent.status in ('pending','consumed','canceled')
  and exists (  -- integrity: gift ↔ business
    select 1 from public.gift g
    where g.id = public.gift_intent.gift_id
      and g.business_id = public.gift_intent.business_id
  )
);
