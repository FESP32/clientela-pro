-- Enable UUID generation if not already enabled
create extension if not exists pgcrypto;

create table if not exists public.response (
  id              uuid primary key default gen_random_uuid(),
  survey_id       uuid not null,        
  respondent_id   uuid,                 
  rating          smallint not null check (rating between 1 and 5),
  selected_traits text[] not null default '{}'::text[],
  comment         text,
  submitted_at    timestamptz not null default now()
);

--  FKs
alter table public.response
  add constraint response_survey_id_fk
  foreign key (survey_id) references public.survey(id)
  on delete cascade;

alter table public.response
  add constraint response_respondent_id_fk_profile
  foreign key (respondent_id) references public.profile(user_id)
  on delete set null;

-- Indexes
create index if not exists idx_response_survey       on public.response (survey_id);
create index if not exists idx_response_respondent   on public.response (respondent_id);
create index if not exists idx_response_submitted_at on public.response (submitted_at);
