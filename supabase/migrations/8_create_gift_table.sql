-- Helper to auto-update updated_at
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
create table if not exists public.gift (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.business(id) on delete cascade,
  title        text not null,
  description  text,
  image_url    text,
  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

create index if not exists idx_gift_business_id on public.gift(business_id);

drop trigger if exists trig_touch_gift on public.gift;
create trigger trig_touch_gift
before update on public.gift
for each row execute procedure public.touch_updated_at();

-- =========================
-- Gift Intents
-- =========================
create table if not exists public.gift_intent (
  id           uuid primary key default gen_random_uuid(),

  gift_id      uuid not null references public.gift(id) on delete cascade,
  issuer_id    uuid not null references public.profile(user_id) on delete cascade, -- creator
  customer_id  uuid     references public.profile(user_id) on delete set null,     -- claimant (NULL until claimed)

  status       text not null default 'pending'
               check (status in ('pending','consumed','canceled','claimed')),
  expires_at   timestamptz,
  consumed_at  timestamptz,

  created_at   timestamptz not null default timezone('utc', now()),
  updated_at   timestamptz not null default timezone('utc', now())
);

create index if not exists idx_gift_intent_gift     on public.gift_intent(gift_id);
create index if not exists idx_gift_intent_issuer   on public.gift_intent(issuer_id);
create index if not exists idx_gift_intent_customer on public.gift_intent(customer_id);
create index if not exists idx_gift_intent_status   on public.gift_intent(status);
create index if not exists idx_gift_intent_expires  on public.gift_intent(expires_at);

drop trigger if exists trig_touch_gift_intent on public.gift_intent;
create trigger trig_touch_gift_intent
before update on public.gift_intent
for each row execute procedure public.touch_updated_at();
