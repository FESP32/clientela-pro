create extension if not exists pgcrypto;

create table if not exists public.stamp_card (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null,
  title            text not null,
  goal_text        text not null,
  stamps_required  integer not null check (stamps_required >= 1),
  status       text not null default 'active' 
    check (status in ('active', 'inactive', 'finished')),
  valid_from       timestamptz not null default now(),
  valid_to         timestamptz not null,
  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz not null default timezone('utc', now())
);

alter table public.stamp_card
  drop constraint if exists stamp_card_business_id_fk,
  add constraint stamp_card_business_id_fk
    foreign key (business_id) references public.business(id)
    on delete cascade;

create index if not exists idx_stamp_business_id on public.stamp_card(business_id);
create index if not exists idx_stamp_card_status on public.stamp_card(status);

-- Card ↔ Product mapping (M:N)
create table if not exists public.stamp_card_product (
  card_id     uuid not null,
  product_id  uuid not null,
  primary key (card_id, product_id)
);

alter table public.stamp_card_product
  drop constraint if exists stamp_card_product_card_id_fk,
  add constraint stamp_card_product_card_id_fk
    foreign key (card_id) references public.stamp_card(id)
    on delete cascade;

alter table public.stamp_card_product
  drop constraint if exists stamp_card_product_product_id_fk,
  add constraint stamp_card_product_product_id_fk
    foreign key (product_id) references public.product(id)
    on delete cascade;

create index if not exists idx_stamp_card_products_product on public.stamp_card_product(product_id);

create table if not exists public.stamp_punch (
  id           uuid primary key default gen_random_uuid(),
  card_id      uuid not null,
  customer_id  uuid not null,
  qty          integer not null default 1 check (qty >= 1),
  note         text,
  created_at   timestamptz not null default timezone('utc', now())
);

alter table public.stamp_punch
  drop constraint if exists stamp_punch_card_id_fk,
  add constraint stamp_punch_card_id_fk
    foreign key (card_id) references public.stamp_card(id)
    on delete cascade;

alter table public.stamp_punch
  drop constraint if exists stamp_punch_customer_id_fk_profile,
  add constraint stamp_punch_customer_id_fk_profile
    foreign key (customer_id) references public.profile(user_id)
    on delete cascade;

create index if not exists idx_stamp_punch_card          on public.stamp_punch(card_id);
create index if not exists idx_stamp_punch_customer      on public.stamp_punch(customer_id);
create index if not exists idx_stamp_punch_card_customer on public.stamp_punch(card_id, customer_id);

create table if not exists public.stamp_intent (
  id           uuid primary key default gen_random_uuid(),
  card_id      uuid not null,
  business_id  uuid not null,
  customer_id  uuid,
  qty          integer not null check (qty >= 1),
  status       text not null default 'pending' check (status in ('pending','consumed','canceled')),
  note         text,
  expires_at   timestamptz,
  consumed_at  timestamptz,
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

alter table public.stamp_intent
  drop constraint if exists stamp_intent_card_id_fk,
  add constraint stamp_intent_card_id_fk
    foreign key (card_id) references public.stamp_card(id)
    on delete cascade;

alter table public.stamp_intent
  drop constraint if exists stamp_intent_business_id_fk,
  add constraint stamp_intent_business_id_fk
    foreign key (business_id) references public.business(id)
    on delete cascade;

alter table public.stamp_intent
  drop constraint if exists stamp_intent_customer_id_fk_profile,
  add constraint stamp_intent_customer_id_fk_profile
    foreign key (customer_id) references public.profile(user_id)
    on delete set null;

create index if not exists idx_stamp_intent_card       on public.stamp_intent(card_id);
create index if not exists idx_stamp_intent_customer   on public.stamp_intent(customer_id);
create index if not exists idx_stamp_intent_status     on public.stamp_intent(status);
create index if not exists idx_stamp_intent_expires_at on public.stamp_intent(expires_at);


-- ---------------------------------------------------------
-- RLS
-- ---------------------------------------------------------
alter table public.stamp_card         enable row level security;
alter table public.stamp_card_product enable row level security;
alter table public.stamp_punch        enable row level security;
alter table public.stamp_intent       enable row level security;

-- ---------------------------------------------------------
-- POLICIES
-- ---------------------------------------------------------

-- ========================
-- stamp_card (the program)
-- ========================
drop policy if exists stamp_card_select_merchant on public.stamp_card;
drop policy if exists stamp_card_select_customer on public.stamp_card;
drop policy if exists stamp_card_cud_merchant    on public.stamp_card;

-- MERCHANT READ: business members/owners can see their own cards
create policy stamp_card_select_merchant
on public.stamp_card
for select
to authenticated
using (
  public.is_business_member(business_id)
  or public.is_business_owner(business_id)
);

-- CUSTOMER READ: customers can see only active cards within validity window
create policy stamp_card_select_customer
on public.stamp_card
for select
to authenticated
using (
  public.is_user_customer()
  and status = 'active'
  and (valid_from is null or valid_from <= timezone('utc', now()))
  and (valid_to   is null or valid_to   >= timezone('utc', now()))
);

-- MERCHANT C/U/D: only merchants of that business may manage cards
create policy stamp_card_cud_merchant
on public.stamp_card
for all
to authenticated
using (
  public.is_user_merchant()
  and (public.is_business_member(business_id) or public.is_business_owner(business_id))
)
with check (
  public.is_user_merchant()
  and (public.is_business_member(business_id) or public.is_business_owner(business_id))
);

-- ===========================
-- stamp_card_product (M : N)
-- ===========================
drop policy if exists stamp_cp_select_merchant on public.stamp_card_product;
drop policy if exists stamp_cp_select_customer on public.stamp_card_product;
drop policy if exists stamp_cp_cud_merchant    on public.stamp_card_product;

-- MERCHANT READ
create policy stamp_cp_select_merchant
on public.stamp_card_product
for select
to authenticated
using (
  exists (
    select 1
    from public.stamp_card sc
    where sc.id = public.stamp_card_product.card_id
      and (public.is_business_member(sc.business_id) or public.is_business_owner(sc.business_id))
  )
);

-- CUSTOMER READ: only for active/in-window cards
create policy stamp_cp_select_customer
on public.stamp_card_product
for select
to authenticated
using (
  public.is_user_customer()
  and exists (
    select 1
    from public.stamp_card sc
    where sc.id = public.stamp_card_product.card_id
      and sc.status = 'active'
      and (sc.valid_from is null or sc.valid_from <= timezone('utc', now()))
      and (sc.valid_to   is null or sc.valid_to   >= timezone('utc', now()))
  )
);

-- MERCHANT C/U/D
create policy stamp_cp_cud_merchant
on public.stamp_card_product
for all
to authenticated
using (
  exists (
    select 1
    from public.stamp_card sc
    where sc.id = public.stamp_card_product.card_id
      and (public.is_business_member(sc.business_id) or public.is_business_owner(sc.business_id))
  )
)
with check (
  exists (
    select 1
    from public.stamp_card sc
    where sc.id = public.stamp_card_product.card_id
      and (public.is_business_member(sc.business_id) or public.is_business_owner(sc.business_id))
  )
);

-- =====================
-- stamp_punch (events)
-- =====================
drop policy if exists stamp_punch_select_merchant  on public.stamp_punch;
drop policy if exists stamp_punch_select_self      on public.stamp_punch;
drop policy if exists stamp_punch_insert_merch     on public.stamp_punch;
drop policy if exists stamp_punch_insert_customer  on public.stamp_punch;
drop policy if exists stamp_punch_update_merch     on public.stamp_punch;
drop policy if exists stamp_punch_delete_merch     on public.stamp_punch;

-- MERCHANT READ
create policy stamp_punch_select_merchant
on public.stamp_punch
for select
to authenticated
using (
  exists (
    select 1
    from public.stamp_card sc
    where sc.id = public.stamp_punch.card_id
      and (public.is_business_member(sc.business_id) or public.is_business_owner(sc.business_id))
  )
);

-- CUSTOMER READ: only own punches
create policy stamp_punch_select_self
on public.stamp_punch
for select
to authenticated
using ( customer_id = auth.uid() );

-- MERCHANT INSERT (staff action)
create policy stamp_punch_insert_merch
on public.stamp_punch
for insert
to authenticated
with check (
  exists (
    select 1
    from public.stamp_card sc
    where sc.id = public.stamp_punch.card_id
      and (public.is_business_member(sc.business_id) or public.is_business_owner(sc.business_id))
  )
);

-- CUSTOMER INSERT: self-stamp on active/in-window cards
create policy stamp_punch_insert_customer
on public.stamp_punch
for insert
to authenticated
with check (
  customer_id = auth.uid()
  and exists (
    select 1
    from public.stamp_card sc
    where sc.id = public.stamp_punch.card_id
      and sc.status = 'active'
      and (sc.valid_from is null or sc.valid_from <= timezone('utc', now()))
      and (sc.valid_to   is null or sc.valid_to   >= timezone('utc', now()))
  )
  and qty >= 1
);

-- MERCHANT UPDATE
create policy stamp_punch_update_merch
on public.stamp_punch
for update
to authenticated
using (
  exists (
    select 1
    from public.stamp_card sc
    where sc.id = public.stamp_punch.card_id
      and (public.is_business_member(sc.business_id) or public.is_business_owner(sc.business_id))
  )
)
with check (
  exists (
    select 1
    from public.stamp_card sc
    where sc.id = public.stamp_punch.card_id
      and (public.is_business_member(sc.business_id) or public.is_business_owner(sc.business_id))
  )
);

-- MERCHANT DELETE
create policy stamp_punch_delete_merch
on public.stamp_punch
for delete
to authenticated
using (
  exists (
    select 1
    from public.stamp_card sc
    where sc.id = public.stamp_punch.card_id
      and (public.is_business_member(sc.business_id) or public.is_business_owner(sc.business_id))
  )
);

-- ======================
-- stamp_intent (grants)
-- ======================
drop policy if exists stamp_intent_select_merch           on public.stamp_intent;
drop policy if exists stamp_intent_select_self            on public.stamp_intent;
drop policy if exists stamp_intent_select_customer_open   on public.stamp_intent;
drop policy if exists stamp_intent_insert_merch           on public.stamp_intent;
drop policy if exists stamp_intent_update_merch           on public.stamp_intent;
drop policy if exists stamp_intent_update_customer_consume on public.stamp_intent;
drop policy if exists stamp_intent_delete_merch           on public.stamp_intent;

-- MERCHANT READ: intents for your business (and card belongs to same business)
create policy stamp_intent_select_merch
on public.stamp_intent
for select
to authenticated
using (
  (public.is_business_member(business_id) or public.is_business_owner(business_id))
  and exists (
    select 1 from public.stamp_card sc
    where sc.id = public.stamp_intent.card_id
      and sc.business_id = public.stamp_intent.business_id
  )
);

-- CUSTOMER READ (private): see your own intents (any status)
create policy stamp_intent_select_self
on public.stamp_intent
for select
to authenticated
using ( customer_id = auth.uid() );

-- CUSTOMER READ (open offers): pending, not expired, active/in-window card,
-- and either unassigned or assigned to them.
create policy stamp_intent_select_customer_open
on public.stamp_intent
for select
to authenticated
using (
  public.is_user_customer()
  and status = 'pending'
  and (expires_at is null or expires_at >= timezone('utc', now()))
  and exists (
    select 1
    from public.stamp_card sc
    where sc.id = public.stamp_intent.card_id
      and sc.status = 'active'
      and (sc.valid_from is null or sc.valid_from <= timezone('utc', now()))
      and (sc.valid_to   is null or sc.valid_to   >= timezone('utc', now()))
  )
  and (customer_id is null or customer_id = auth.uid())
);

-- MERCHANT INSERT: require card↔business consistency
create policy stamp_intent_insert_merch
on public.stamp_intent
for insert
to authenticated
with check (
  (public.is_business_member(business_id) or public.is_business_owner(business_id))
  and exists (
    select 1 from public.stamp_card sc
    where sc.id = public.stamp_intent.card_id
      and sc.business_id = public.stamp_intent.business_id
  )
);

-- MERCHANT UPDATE: moderation (e.g., mark consumed/canceled)
create policy stamp_intent_update_merch
on public.stamp_intent
for update
to authenticated
using (
  (public.is_business_member(business_id) or public.is_business_owner(business_id))
  and exists (
    select 1 from public.stamp_card sc
    where sc.id = public.stamp_intent.card_id
      and sc.business_id = public.stamp_intent.business_id
  )
)
with check (
  (public.is_business_member(business_id) or public.is_business_owner(business_id))
  and exists (
    select 1 from public.stamp_card sc
    where sc.id = public.stamp_intent.card_id
      and sc.business_id = public.stamp_intent.business_id
  )
);

-- CUSTOMER UPDATE (consume): allow customers to consume open intents.
-- OLD ROW must be: pending, not expired, active/in-window card,
-- and unassigned or already assigned to the caller.
-- NEW ROW must become: consumed by the caller, with a non-null consumed_at.
create policy stamp_intent_update_customer_consume
on public.stamp_intent
for update
to authenticated
using (
  public.is_user_customer()
  and status = 'pending'
  and (customer_id is null or customer_id = auth.uid())
  and (expires_at is null or expires_at >= timezone('utc', now()))
  and exists (
    select 1 from public.stamp_card sc
    where sc.id = public.stamp_intent.card_id
      and sc.status = 'active'
      and (sc.valid_from is null or sc.valid_from <= timezone('utc', now()))
      and (sc.valid_to   is null or sc.valid_to   >= timezone('utc', now()))
  )
)
with check (
  public.is_user_customer()
  and status = 'consumed'
  and customer_id = auth.uid()
  and consumed_at is not null
  and exists (
    select 1 from public.stamp_card sc
    where sc.id = public.stamp_intent.card_id
      and sc.status = 'active'
      and (sc.valid_from is null or sc.valid_from <= timezone('utc', now()))
      and (sc.valid_to   is null or sc.valid_to   >= timezone('utc', now()))
  )
);

-- MERCHANT DELETE
create policy stamp_intent_delete_merch
on public.stamp_intent
for delete
to authenticated
using (
  (public.is_business_member(business_id) or public.is_business_owner(business_id))
  and exists (
    select 1 from public.stamp_card sc
    where sc.id = public.stamp_intent.card_id
      and sc.business_id = public.stamp_intent.business_id
  )
);
