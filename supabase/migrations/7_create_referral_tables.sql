-- Reuse if already defined elsewhere
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end$$;

-- =========================
-- Programs
-- =========================
create table if not exists public.referral_program (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null,  -- FK added below
  title            text not null,
  is_active        boolean not null default true,
  referrer_reward  text,
  referred_reward  text,

  valid_from       timestamptz,
  valid_to         timestamptz,
  code             text not null,
  per_referrer_cap integer check (per_referrer_cap is null or per_referrer_cap >= 1),
  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz not null default timezone('utc', now()),
  constraint chk_refprog_valid_range check (
    valid_from is null or valid_to is null or valid_to > valid_from
  )
);

-- Explicit FK: referral_program.business_id → business(id)
alter table public.referral_program
  add constraint referral_program_business_id_fk
  foreign key (business_id) references public.business(id)
  on delete cascade;

-- Make program code unique per business
create unique index if not exists uq_referral_program_code on public.referral_program(business_id, code);

create index if not exists idx_referral_business_id on public.referral_program(business_id);
create index if not exists idx_referral_program_active on public.referral_program(is_active);

drop trigger if exists trig_touch_referral_program on public.referral_program;
create trigger trig_touch_referral_program
before update on public.referral_program
for each row execute procedure public.touch_updated_at();

-- =========================
-- Participants (per referrer in a program)
-- =========================
create table if not exists public.referral_program_participant (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null,  -- FK added below
  customer_id  uuid not null,  -- FK added below

  referred_qty integer not null default 0 check (referred_qty >= 0),
  note         text,

  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now()),

  -- one row per customer per program
  unique (program_id, customer_id)
);

-- Explicit FKs
alter table public.referral_program_participant
  add constraint referral_program_participant_program_id_fk
  foreign key (program_id) references public.referral_program(id)
  on delete cascade;

alter table public.referral_program_participant
  add constraint referral_program_participant_customer_id_fk_profile
  foreign key (customer_id) references public.profile(user_id)
  on delete cascade;

create index if not exists idx_ref_participant_program on public.referral_program_participant(program_id);
create index if not exists idx_ref_participant_customer on public.referral_program_participant(customer_id);

drop trigger if exists trig_touch_referral_program_participant on public.referral_program_participant;
create trigger trig_touch_referral_program_participant
before update on public.referral_program_participant
for each row execute procedure public.touch_updated_at();

-- =========================
-- Intents (an invite/claim object tied to the program & referrer)
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
  add constraint referral_intent_program_id_fk
  foreign key (program_id) references public.referral_program(id)
  on delete cascade;

alter table public.referral_intent
  add constraint referral_intent_referrer_id_fk_profile
  foreign key (referrer_id) references public.profile(user_id)
  on delete cascade;

alter table public.referral_intent
  add constraint referral_intent_referred_id_fk_profile
  foreign key (referred_id) references public.profile(user_id)
  on delete set null;

create index if not exists idx_ref_intent_program  on public.referral_intent(program_id);
create index if not exists idx_ref_intent_referrer on public.referral_intent(referrer_id);
create index if not exists idx_ref_intent_referred on public.referral_intent(referred_id);
create index if not exists idx_ref_intent_status   on public.referral_intent(status);
create index if not exists idx_ref_intent_expires  on public.referral_intent(expires_at);

drop trigger if exists trig_touch_referral_intents on public.referral_intent;
create trigger trig_touch_referral_intent
before update on public.referral_intent
for each row execute procedure public.touch_updated_at();
