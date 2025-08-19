-- Enable UUID generation if not already enabled
create extension if not exists pgcrypto;

-- 1) Table
create table if not exists public.responses (
  id              uuid primary key default gen_random_uuid(),
  survey_id       uuid not null references public.surveys (id) on delete cascade,
  respondent_id   uuid references public.profiles (user_id) on delete set null,
  rating          smallint not null check (rating between 1 and 5),
  selected_traits text[] not null default '{}',
  comment         text,
  submitted_at    timestamptz not null default now()
);

-- 2) Indexes
create index if not exists idx_responses_survey       on public.responses (survey_id);
create index if not exists idx_responses_respondent   on public.responses (respondent_id);
create index if not exists idx_responses_submitted_at on public.responses (submitted_at);

-- 3) RLS
alter table public.responses enable row level security;

-- Drop + recreate policies (safe to re-run)
drop policy if exists responses_owner_select on public.responses;
create policy responses_owner_select
  on public.responses for select
  using (
    exists (
      select 1 from public.surveys s
      where s.id = responses.survey_id
        and s.owner_id = auth.uid()
    )
  );

drop policy if exists responses_self_select on public.responses;
create policy responses_self_select
  on public.responses for select
  using (respondent_id = auth.uid());

drop policy if exists responses_insert_active on public.responses;
create policy responses_insert_active
  on public.responses for insert
  with check (
    exists (
      select 1 from public.surveys s
      where s.id = survey_id
        and s.is_active = true
        and (s.starts_at is null or now() >= s.starts_at)
        and (s.ends_at   is null or now() <= s.ends_at)
    )
  );
