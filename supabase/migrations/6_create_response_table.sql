-- =========================================================
-- public.response — full migration with RLS and comments
-- (supports anonymous submissions from non-authenticated users)
-- =========================================================

-- Enable UUID generation (safe if already enabled)
create extension if not exists pgcrypto;

-- =========================================================
-- Table: response
-- =========================================================
create table if not exists public.response (
  id              uuid primary key default gen_random_uuid(),
  survey_id       uuid not null,                         -- FK to survey
  respondent_id   uuid,                                  -- nullable to support anonymous responses
  rating          smallint not null check (rating between 1 and 5),
  selected_traits text[] not null default '{}'::text[],
  comment         text,
  submitted_at    timestamptz not null default now()
);

-- -------------------------
-- Foreign keys (idempotent)
-- -------------------------
alter table public.response
  drop constraint if exists response_survey_id_fk,
  add constraint response_survey_id_fk
    foreign key (survey_id) references public.survey(id)
    on delete cascade;

alter table public.response
  drop constraint if exists response_respondent_id_fk_profile,
  add constraint response_respondent_id_fk_profile
    foreign key (respondent_id) references public.profile(user_id)
    on delete set null;

-- ---------------
-- Helpful indexes
-- ---------------
create index if not exists idx_response_survey       on public.response (survey_id);
create index if not exists idx_response_respondent   on public.response (respondent_id);
create index if not exists idx_response_submitted_at on public.response (submitted_at);

-- =========================================================
-- Enable Row Level Security
-- =========================================================
alter table public.response enable row level security;
-- Optional hardening:
-- alter table public.response force row level security;

-- =========================================================
-- Remove prior policies (so this file is idempotent)
-- =========================================================
drop policy if exists response_select_merchant     on public.response;
drop policy if exists response_select_self         on public.response;
drop policy if exists response_insert_customer     on public.response;
drop policy if exists response_insert_anon         on public.response;
drop policy if exists response_delete_self         on public.response;
drop policy if exists response_delete_merchant     on public.response;

-- =========================================================
-- POLICIES (with line-by-line comments)
-- =========================================================

-- -----------------------------------------------------------------------------
-- READ for MERCHANTS:
-- Merchants (business members/owners) can read responses for surveys
-- that belong to their businesses (regardless of survey active window).
-- -----------------------------------------------------------------------------
create policy response_select_merchant
on public.response                        -- << target table: response
for select                                -- << applies to SELECT
to authenticated                          -- << only signed-in users
using (                                   -- << row is visible when this predicate is TRUE
  exists (
    select 1
    from public.survey s
    where s.id = public.response.survey_id                  -- << join response → survey
      and (                                                 -- << allow if user is member OR owner
        public.is_business_member(s.business_id)            -- << user appears in business_user
        or exists (                                         -- << OR they are the owner of that business
          select 1 from public.business b
          where b.id = s.business_id
            and b.owner_id = auth.uid()
        )
      )
  )
);

-- -----------------------------------------------------------------------------
-- READ for CUSTOMERS:
-- A customer can read their own responses (historical or current).
-- Anonymous responses (respondent_id IS NULL) are not linkable to users,
-- so customers cannot see those unless they chose to attach their ID.
-- -----------------------------------------------------------------------------
create policy response_select_self
on public.response                        -- << target table: response
for select                                -- << applies to SELECT
to authenticated                          -- << only signed-in users
using (
  respondent_id = auth.uid()              -- << only rows authored by the current user
);

-- -----------------------------------------------------------------------------
-- INSERT for AUTHENTICATED CUSTOMERS (supports anonymous surveys):
-- Customers can submit a response to a survey ONLY if:
--   • they are a 'customer'
--   • the target survey is active and within its optional time window
--   • and anonymity rules are respected:
--       - If survey.is_anonymous = true: respondent_id may be NULL *or* = auth.uid()  (soft anonymity)
--       - If survey.is_anonymous = false: respondent_id must = auth.uid()
-- -----------------------------------------------------------------------------
create policy response_insert_customer
on public.response                        -- << target table: response
for insert                                -- << applies to INSERT
to authenticated                          -- << only signed-in users
with check (
  exists (
    select 1
    from public.survey s
    where s.id = public.response.survey_id                -- << the target survey exists
      and s.status = 'active'                             -- << survey marked active
      and (s.starts_at is null or s.starts_at <= now())   -- << has started (or no start time)
      and (s.ends_at   is null or s.ends_at   >= now())   -- << not ended yet (or no end time)
      and (
        -- SOFT ANONYMITY (recommended):
        -- Anonymous survey → allow NULL or self; Non-anon → must be self.
           (s.is_anonymous = true  and (public.response.respondent_id is null
                                    or  public.response.respondent_id = auth.uid()))
        or (s.is_anonymous = false and  public.response.respondent_id = auth.uid())
      )
  )
);

-- -----------------------------------------------------------------------------
-- INSERT for NON-AUTHENTICATED USERS (ANON ROLE):
-- Allow public (not logged in) users to submit responses to surveys
-- that explicitly allow anonymity. To prevent identity spoofing,
-- require respondent_id to be NULL for anon inserts.
-- -----------------------------------------------------------------------------
create policy response_insert_anon
on public.response                        -- << target table: response
for insert                                -- << applies to INSERT
to anon                                   -- << unauthenticated users (role: anon)
with check (                              -- << the NEW row must satisfy this predicate
  exists (
    select 1
    from public.survey s
    where s.id = public.response.survey_id                -- << the target survey exists
      and s.status = 'active'                              -- << survey marked active
      and (s.starts_at is null or s.starts_at <= now())   -- << has started (or no start time)
      and (s.ends_at   is null or s.ends_at   >= now())   -- << not ended yet (or no end time)
      and s.is_anonymous = true                           -- << ONLY anonymous surveys accept anon inserts
  )
  and public.response.respondent_id is null               -- << enforce strict anonymity for anon callers
);

create policy response_delete_merchant
on public.response                        -- << target table: response
for delete                                -- << applies to DELETE
to authenticated                          -- << only signed-in users
using (
  exists (
    select 1
    from public.survey s
    where s.id = public.response.survey_id                  -- << join response → survey
      and (                                                 -- << allow if user is member OR owner
        public.is_business_member(s.business_id)            -- << merchant is member of that business
        or exists (                                         -- << OR owner of that business
          select 1 from public.business b
          where b.id = s.business_id
            and b.owner_id = auth.uid()
        )
      )
  )
);


-- Count responses (ignores RLS), capped at 250, returns SMALLINT
create or replace function public.count_responses_for_survey(p_survey_id uuid)
returns smallint
language sql
stable
security definer
set search_path = public
as $$
  select least(count(*)::int, 250)::smallint
  from public.response r
  where r.survey_id = p_survey_id;
$$;

revoke all on function public.count_responses_for_survey(uuid) from public;
grant execute on function public.count_responses_for_survey(uuid) to authenticated;
grant execute on function public.count_responses_for_survey(uuid) to anon; -- if you want public access

