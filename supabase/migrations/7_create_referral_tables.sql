-- Reuse if already defined elsewhere
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end$$;

-- Programs
create table if not exists public.referral_program (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references public.profiles(user_id) on delete cascade,
  title            text not null,
  is_active        boolean not null default true,

  -- keep simple text for now; you can later normalize to type/value columns
  referrer_reward  text,
  referred_reward  text,

  valid_from       timestamptz,
  valid_to         timestamptz,
  code             text not null,          -- e.g. a program join code or slug

  -- NULL = unlimited; otherwise must be >= 1
  per_referrer_cap integer check (per_referrer_cap is null or per_referrer_cap >= 1),

  created_at       timestamptz not null default timezone('utc', now()),
  updated_at       timestamptz not null default timezone('utc', now()),

  -- validity guard
  constraint chk_refprog_valid_range check (
    valid_from is null or valid_to is null or valid_to > valid_from
  )
);

-- Make program code unique (global). If you prefer per owner, make a composite unique.
create unique index if not exists uq_referral_program_code on public.referral_program(owner_id, code);

create index if not exists idx_referral_program_owner on public.referral_program(owner_id);
create index if not exists idx_referral_program_active on public.referral_program(is_active);

drop trigger if exists trig_touch_referral_program on public.referral_program;
create trigger trig_touch_referral_program
before update on public.referral_program
for each row execute procedure public.touch_updated_at();

-- Participants (per referrer in a program)
create table if not exists public.referral_program_participant (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null references public.referral_program(id) on delete cascade,
  customer_id  uuid not null references public.profiles(user_id) on delete cascade,

  referred_qty integer not null default 0 check (referred_qty >= 0),
  note         text,

  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now()),

  -- one row per customer per program
  unique (program_id, customer_id)
);

create index if not exists idx_ref_participant_program on public.referral_program_participant(program_id);
create index if not exists idx_ref_participant_customer on public.referral_program_participant(customer_id);

drop trigger if exists trig_touch_referral_program_participant on public.referral_program_participant;
create trigger trig_touch_referral_program_participant
before update on public.referral_program_participant
for each row execute procedure public.touch_updated_at();

-- Intents (an invite/claim object tied to the program & referrer)
create table if not exists public.referral_intents (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null references public.referral_program(id) on delete cascade,
  referrer_id  uuid not null references public.profiles(user_id) on delete cascade,
  referred_id  uuid references public.profiles(user_id) on delete set null,  -- set after signup/claim

  status       text not null default 'pending'
               check (status in ('pending','consumed','canceled','claimed')), -- consider: 'qualified','rewarded'
  expires_at   timestamptz,                                         -- optional but useful
  consumed_at  timestamptz,

  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

create index if not exists idx_ref_intents_program  on public.referral_intents(program_id);
create index if not exists idx_ref_intents_referrer on public.referral_intents(referrer_id);
create index if not exists idx_ref_intents_referred on public.referral_intents(referred_id);
create index if not exists idx_ref_intents_status   on public.referral_intents(status);
create index if not exists idx_ref_intents_expires  on public.referral_intents(expires_at);

drop trigger if exists trig_touch_referral_intents on public.referral_intents;
create trigger trig_touch_referral_intents
before update on public.referral_intents
for each row execute procedure public.touch_updated_at();
