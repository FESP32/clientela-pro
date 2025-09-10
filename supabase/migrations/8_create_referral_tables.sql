-- =========================================================
-- REFERRALS — Tables (yours) + RLS + Commented Policies
-- =========================================================

-- =========================
-- Programs
-- =========================
create table if not exists public.referral_program (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null,  -- FK added below
  title            text not null,
  status       text not null default 'active' 
    check (status in ('active', 'inactive', 'finished')),
  referrer_reward  text,
  referred_reward  text,
  valid_from       timestamptz not null default now(),
  valid_to         timestamptz not null,
  code             text not null,                         -- business-scoped program code
  per_referrer_cap integer check (per_referrer_cap is null or per_referrer_cap >= 1),
  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz not null default timezone('utc', now()),
  constraint chk_refprog_valid_range check (
    valid_from is null or valid_to is null or valid_to > valid_from
  )
);

-- Explicit FK: referral_program.business_id → business(id)
alter table public.referral_program
  drop constraint if exists referral_program_business_id_fk,
  add constraint referral_program_business_id_fk
  foreign key (business_id) references public.business(id)
  on delete cascade;

-- Make program code unique per business
create unique index if not exists uq_referral_program_code
  on public.referral_program(business_id, code);

create index if not exists idx_referral_business_id on public.referral_program(business_id);
create index if not exists idx_referral_program_status on public.referral_program(status);

drop trigger if exists trig_touch_referral_program on public.referral_program;
create trigger trig_touch_referral_program
before update on public.referral_program
for each row execute procedure public.set_updated_at();

-- =========================
-- Participants (per referrer in a program)
-- =========================
create table if not exists public.referral_program_participant (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null,  -- FK added below
  customer_id  uuid not null,  -- FK added below (the referrer)
  referred_qty integer not null default 0 check (referred_qty >= 0),
  note         text,
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now()),
  unique (program_id, customer_id)                      -- one row per customer per program
);

-- Explicit FKs
alter table public.referral_program_participant
  drop constraint if exists referral_program_participant_program_id_fk,
  add constraint referral_program_participant_program_id_fk
  foreign key (program_id) references public.referral_program(id)
  on delete cascade;

alter table public.referral_program_participant
  drop constraint if exists referral_program_participant_customer_id_fk_profile,
  add constraint referral_program_participant_customer_id_fk_profile
  foreign key (customer_id) references public.profile(user_id)
  on delete cascade;

create index if not exists idx_ref_participant_program  on public.referral_program_participant(program_id);
create index if not exists idx_ref_participant_customer on public.referral_program_participant(customer_id);

drop trigger if exists trig_touch_referral_program_participant on public.referral_program_participant;
create trigger trig_touch_referral_program_participant
before update on public.referral_program_participant
for each row execute procedure public.set_updated_at();

-- =========================
-- Intents (invite/claim object tied to the program & referrer)
-- =========================
create table if not exists public.referral_intent (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null,  -- FK added below
  referrer_id  uuid not null,  -- FK added below
  referred_id  uuid,           -- FK added below (nullable for ON DELETE SET NULL)
  status       text not null default 'pending'
               check (status in ('pending','consumed','canceled','claimed')),
  expires_at   timestamptz,
  consumed_at  timestamptz,
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

-- Explicit FKs
alter table public.referral_intent
  drop constraint if exists referral_intent_program_id_fk,
  add constraint referral_intent_program_id_fk
  foreign key (program_id) references public.referral_program(id)
  on delete cascade;

alter table public.referral_intent
  drop constraint if exists referral_intent_referrer_id_fk_profile,
  add constraint referral_intent_referrer_id_fk_profile
  foreign key (referrer_id) references public.profile(user_id)
  on delete cascade;

alter table public.referral_intent
  drop constraint if exists referral_intent_referred_id_fk_profile,
  add constraint referral_intent_referred_id_fk_profile
  foreign key (referred_id) references public.profile(user_id)
  on delete set null;

create index if not exists idx_ref_intent_program  on public.referral_intent(program_id);
create index if not exists idx_ref_intent_referrer on public.referral_intent(referrer_id);
create index if not exists idx_ref_intent_referred on public.referral_intent(referred_id);
create index if not exists idx_ref_intent_status   on public.referral_intent(status);
create index if not exists idx_ref_intent_expires  on public.referral_intent(expires_at);

drop trigger if exists trig_touch_referral_intent on public.referral_intent;
create trigger trig_touch_referral_intent
before update on public.referral_intent
for each row execute procedure public.set_updated_at();

-- =========================================================
-- Enable Row Level Security
-- =========================================================
alter table public.referral_program             enable row level security;
alter table public.referral_program_participant enable row level security;
alter table public.referral_intent              enable row level security;
-- Optional hardening:
-- alter table public.referral_program             force row level security;
-- alter table public.referral_program_participant force row level security;
-- alter table public.referral_intent              force row level security;

-- =========================================================
-- POLICIES (drop old, then recreate with comments)
-- =========================================================

-- ------------------------------------
-- referral_program (program definition)
-- ------------------------------------
drop policy if exists refprog_select_merchant  on public.referral_program;
drop policy if exists refprog_select_customer  on public.referral_program;
drop policy if exists refprog_cud_merchant     on public.referral_program;

-- MERCHANT READ: business members/owners can see their programs
create policy refprog_select_merchant
on public.referral_program
for select
to authenticated
using (
  public.is_business_member(business_id)             -- << user is a member of this program's business
  or public.is_business_owner(business_id)           -- << or the owner
);

-- CUSTOMER READ: signed-in customers see only active, in-window programs
create policy refprog_select_customer
on public.referral_program
for select
to authenticated
using (
  public.is_user_customer()                          -- << requester is 'customer'
  and status = 'active'                               -- << program enabled
  and (valid_from is null or valid_from <= timezone('utc', now()))  -- << started (or open)
  and (valid_to   is null or valid_to   >= timezone('utc', now()))  -- << not expired (or open)
);

-- MERCHANT C/U/D: only merchants of that business may manage programs
create policy refprog_cud_merchant
on public.referral_program
for all
to authenticated
using (                                              -- << UPDATE/DELETE visibility
  public.is_user_merchant()
  and (public.is_business_member(business_id) or public.is_business_owner(business_id))
)
with check (                                         -- << INSERT/UPDATE new row guard
  public.is_user_merchant()
  and (public.is_business_member(business_id) or public.is_business_owner(business_id))
);

-- ---------------------------------------------------
-- referral_program_participant (enrollment/progress)
-- ---------------------------------------------------
drop policy if exists refpart_select_merchant on public.referral_program_participant;
drop policy if exists refpart_select_self     on public.referral_program_participant;
drop policy if exists refpart_insert          on public.referral_program_participant;
drop policy if exists refpart_update_merch    on public.referral_program_participant;
drop policy if exists refpart_delete_merch    on public.referral_program_participant;

-- MERCHANT READ: see all participants for programs in your business
create policy refpart_select_merchant
on public.referral_program_participant
for select
to authenticated
using (
  exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_program_participant.program_id
      and (public.is_business_member(rp.business_id) or public.is_business_owner(rp.business_id))
  )
);

-- CUSTOMER READ: a referrer can see their own participant row
create policy refpart_select_self
on public.referral_program_participant
for select
to authenticated
using ( customer_id = auth.uid() );

-- INSERT (two paths):
--  • merchant can create any participant for programs in their business
--  • a customer can self-enroll for active, in-window programs (only for themselves)
create policy refpart_insert
on public.referral_program_participant
for insert
to authenticated
with check (
  -- merchant path
  exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_program_participant.program_id
      and (public.is_business_member(rp.business_id) or public.is_business_owner(rp.business_id))
  )
  -- customer self-enroll path (must be the same user; program must be active/in-window)
  or (
    public.is_user_customer()
    and public.referral_program_participant.customer_id = auth.uid()
    and exists (
      select 1
      from public.referral_program rp
      where rp.id = public.referral_program_participant.program_id
        and rp.status = 'active'
        and (rp.valid_from is null or rp.valid_from <= timezone('utc', now()))
        and (rp.valid_to   is null or rp.valid_to   >= timezone('utc', now()))
    )
  )
);

-- UPDATE: only merchants (e.g., adjust referred_qty/note)
create policy refpart_update_merch
on public.referral_program_participant
for update
to authenticated
using (
  exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_program_participant.program_id
      and (public.is_business_member(rp.business_id) or public.is_business_owner(rp.business_id))
  )
)
with check (
  exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_program_participant.program_id
      and (public.is_business_member(rp.business_id) or public.is_business_owner(rp.business_id))
  )
);

-- DELETE: merchants only (customers cannot drop their enrollment)
create policy refpart_delete_merch
on public.referral_program_participant
for delete
to authenticated
using (
  exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_program_participant.program_id
      and (public.is_business_member(rp.business_id) or public.is_business_owner(rp.business_id))
  )
);

-- --------------------------------
-- referral_intent (invites/claims)
-- --------------------------------
drop policy if exists refint_select_merchant                 on public.referral_intent;
drop policy if exists refint_select_referrer                 on public.referral_intent;
drop policy if exists refint_select_referred                 on public.referral_intent;
drop policy if exists refint_insert                          on public.referral_intent;
drop policy if exists refint_update_merchant                 on public.referral_intent;
drop policy if exists refint_update_referrer                 on public.referral_intent;
drop policy if exists refint_update_referred_consume         on public.referral_intent; -- NEW
drop policy if exists refint_delete_merchant                 on public.referral_intent;
drop policy if exists refint_delete_referrer                 on public.referral_intent;

-- MERCHANT READ: see intents for programs in your business
create policy refint_select_merchant
on public.referral_intent
for select
to authenticated
using (
  exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_intent.program_id
      and (public.is_business_member(rp.business_id) or public.is_business_owner(rp.business_id))
  )
);

-- REFERRER READ: see your own intents (any status)
create policy refint_select_referrer
on public.referral_intent
for select
to authenticated
using ( referrer_id = auth.uid() );

-- REFERRED READ: customers can see open (pending, not expired) intents so they can claim
-- (If you only want them to see invites addressed to them, add: AND (referred_id IS NULL OR referred_id = auth.uid()))
create policy refint_select_referred
on public.referral_intent
for select
to authenticated
using (
  public.is_user_customer()
  and public.referral_intent.status = 'pending'
  and (
    public.referral_intent.expires_at is null
    or public.referral_intent.expires_at >= timezone('utc', now())
  )
  and exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_intent.program_id
      and rp.status = 'active'
      and (rp.valid_from is null or rp.valid_from <= timezone('utc', now()))
      and (rp.valid_to   is null or rp.valid_to   >= timezone('utc', now()))
  )
);

-- INSERT (two paths):
--  • merchant can create any intent for programs in their business
--  • a customer referrer may create intents for programs they are enrolled in (self as referrer)
create policy refint_insert
on public.referral_intent
for insert
to authenticated
with check (
  -- merchant path
  exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_intent.program_id
      and (public.is_business_member(rp.business_id) or public.is_business_owner(rp.business_id))
  )
  -- customer (referrer) path
  or (
    public.is_user_customer()
    and public.referral_intent.referrer_id = auth.uid()           -- << cannot create for someone else
    and exists (                                                   -- << must be enrolled in program
      select 1
      from public.referral_program_participant p
      where p.program_id = public.referral_intent.program_id
        and p.customer_id = auth.uid()
    )
    and exists (                                                   -- << program is active / in window
      select 1
      from public.referral_program rp
      where rp.id = public.referral_intent.program_id
        and rp.status = 'active'
        and (rp.valid_from is null or rp.valid_from <= timezone('utc', now()))
        and (rp.valid_to   is null or rp.valid_to   >= timezone('utc', now()))
    )
  )
);

-- UPDATE (merchant moderation): allow merchants to update any intent of their business
-- (e.g., mark consumed/claimed/canceled)
create policy refint_update_merchant
on public.referral_intent
for update
to authenticated
using (
  exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_intent.program_id
      and (public.is_business_member(rp.business_id) or public.is_business_owner(rp.business_id))
  )
)
with check (
  exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_intent.program_id
      and (public.is_business_member(rp.business_id) or public.is_business_owner(rp.business_id))
  )
);

-- UPDATE (referrer self-service): referrer may only cancel their own PENDING intents
-- USING limits which existing rows they can edit (only if current status='pending'),
-- WITH CHECK restricts what the new row can look like (stay pending or become canceled).
create policy refint_update_referrer
on public.referral_intent
for update
to authenticated
using (
  referrer_id = auth.uid()
  and public.referral_intent.status = 'pending'       -- << only pending rows are editable
)
with check (
  referrer_id = auth.uid()
  and public.referral_intent.status in ('pending','canceled')  -- << can switch to 'canceled' (or keep pending)
);

-- NEW: UPDATE (referred customer claim/consume)
-- Allow an authenticated customer to claim an open invite by assigning themselves
-- (referred_id := auth.uid()), setting status := 'consumed', and providing consumed_at.
drop policy if exists refint_update_referred_consume on public.referral_intent;

create policy refint_update_referred_consume
on public.referral_intent
for update
to authenticated
using (
  public.is_user_customer()
  and public.referral_intent.status = 'pending'                 -- old row must be pending
  and (public.referral_intent.referred_id is null
       or public.referral_intent.referred_id = auth.uid())      -- unassigned or already addressed to caller
  and (public.referral_intent.expires_at is null
       or public.referral_intent.expires_at >= timezone('utc', now()))  -- not expired
  and exists (                                                   -- program active and in window
    select 1
    from public.referral_program rp
    where rp.id = public.referral_intent.program_id
      and rp.status = 'active'
      and (rp.valid_from is null or rp.valid_from <= timezone('utc', now()))
      and (rp.valid_to   is null or rp.valid_to   >= timezone('utc', now()))
  )
)
with check (
  public.is_user_customer()
  and public.referral_intent.status = 'consumed'                 -- new row must be consumed
  and public.referral_intent.referred_id = auth.uid()            -- assigned to the acting customer
  and public.referral_intent.consumed_at is not null             -- timestamp provided
  and exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_intent.program_id
      and rp.status = 'active'
      and (rp.valid_from is null or rp.valid_from <= timezone('utc', now()))
      and (rp.valid_to   is null or rp.valid_to   >= timezone('utc', now()))
  )
);

-- DELETE (merchant): allow deleting intents in your business (cleanup/mistakes)
create policy refint_delete_merchant
on public.referral_intent
for delete
to authenticated
using (
  exists (
    select 1
    from public.referral_program rp
    where rp.id = public.referral_intent.program_id
      and (public.is_business_member(rp.business_id) or public.is_business_owner(rp.business_id))
  )
);
