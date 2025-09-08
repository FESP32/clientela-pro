-- =========================================================
-- public.survey — full migration with RLS and comments
-- (adds anon SELECT for anonymous, active, in-window surveys)
-- =========================================================

-- Enable UUIDs (safe if already enabled)
create extension if not exists pgcrypto;

-- =========================================================
-- survey table
-- =========================================================
create table if not exists public.survey (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null,
  business_id  uuid not null,
  title        text not null,
  description  text,
  traits       jsonb not null default '[]'::jsonb,
  is_anonymous boolean not null default false,   -- when true, responses may be anonymous
  is_active    boolean not null default true,    -- survey is enabled for collection
  starts_at    timestamptz,                      -- optional open window start
  ends_at      timestamptz,                      -- optional open window end
  settings     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- FKs
alter table public.survey
  drop constraint if exists survey_product_id_fk,
  add constraint survey_product_id_fk
    foreign key (product_id) references public.product(id)
    on delete cascade;

alter table public.survey
  drop constraint if exists survey_business_id_fk,
  add constraint survey_business_id_fk
    foreign key (business_id) references public.business(id)
    on delete cascade;

-- Helpful indexes
create index if not exists survey_product_id_idx  on public.survey (product_id);
create index if not exists survey_business_id_idx on public.survey (business_id);

-- Keep updated_at fresh (assumes public.trigger_set_timestamp() exists)
drop trigger if exists set_timestamp_on_survey on public.survey;
create trigger set_timestamp_on_survey
before update on public.survey
for each row execute function public.trigger_set_timestamp();

-- =========================================================
-- Enable Row Level Security
-- =========================================================
alter table public.survey enable row level security;
-- Optional hardening:
-- alter table public.survey force row level security;

-- Clean any prior policies so this migration is idempotent
drop policy if exists survey_select_merchant        on public.survey;
drop policy if exists survey_select_customer_active on public.survey;
drop policy if exists survey_select_anon_active     on public.survey;
drop policy if exists survey_cud_merchant           on public.survey;

-- ========
-- POLICIES 
-- ========

-- -----------------------------------------------------------------------------
-- READ for MERCHANTS (business members/owners)
-- -----------------------------------------------------------------------------
create policy survey_select_merchant
on public.survey                 -- << policy targets the 'survey' table
for select                       -- << applies to SELECT statements
to authenticated                 -- << only logged-in users (merchants operate authenticated)
using (                          -- << rows are visible when this predicate is TRUE
  public.is_business_member(business_id)  -- << user is a member of the survey's business
  or exists (                    -- << OR, the user is the owner of the business
    select 1
    from public.business b
    where b.id = public.survey.business_id  -- << business owning the survey
      and b.owner_id = auth.uid()           -- << current user owns that business
  )
);

-- -----------------------------------------------------------------------------
-- READ for CUSTOMERS (signed-in public/consumer view)
-- Customers can only read surveys that are ACTIVE and IN WINDOW.
-- -----------------------------------------------------------------------------
create policy survey_select_customer_active
on public.survey                 -- << policy targets the 'survey' table
for select                       -- << applies to SELECT statements
to authenticated                 -- << only logged-in users (role: authenticated)
using (                          -- << rows are visible when this predicate is TRUE
  public.is_user_customer()      -- << current user is of type 'customer'
  and is_active = true           -- << survey is marked active
  and (starts_at is null or starts_at <= now())  -- << has started (or no start)
  and (ends_at   is null or ends_at   >= now())  -- << not ended yet (or no end)
);

-- -----------------------------------------------------------------------------
-- READ for NON-AUTHENTICATED USERS (ANON ROLE)
-- Allow anyone (not signed in) to read surveys that:
--   • are explicitly anonymous (responses are anonymous),
--   • are active,
--   • and are within the optional time window.
-- -----------------------------------------------------------------------------
create policy survey_select_anon_active
on public.survey                 -- << policy targets the 'survey' table
for select                       -- << applies to SELECT statements
to anon                          -- << unauthenticated users (role: anon)
using (                          -- << rows are visible when this predicate is TRUE
  is_active = true           -- << survey is marked active
  and (starts_at is null or starts_at <= now())  -- << has started (or no start)
  and (ends_at   is null or ends_at   >= now())  -- << not ended yet (or no end)
);

-- -----------------------------------------------------------------------------
-- CREATE / UPDATE / DELETE for MERCHANTS
-- Merchants can fully manage surveys belonging to businesses they are part of.
-- -----------------------------------------------------------------------------
create policy survey_cud_merchant
on public.survey                 -- << policy targets the 'survey' table
for all                          -- << applies to INSERT, UPDATE, and DELETE
to authenticated                 -- << only logged-in users
using (                          -- << for UPDATE/DELETE, row must be visible if TRUE
  public.is_user_merchant()      -- << current user is of type 'merchant'
  and (                          -- << and either member or owner of the business
    public.is_business_member(business_id)
    or exists (
      select 1
      from public.business b
      where b.id = public.survey.business_id
        and b.owner_id = auth.uid()
    )
  )
)
with check (                     -- << for INSERT/UPDATE, NEW row must satisfy this
  public.is_user_merchant()      -- << enforces that only merchants can create/modify
  and (                          -- << and ties the new/updated row to a business they control
    public.is_business_member(business_id)
    or exists (
      select 1
      from public.business b
      where b.id = public.survey.business_id
        and b.owner_id = auth.uid()
    )
  )
);
