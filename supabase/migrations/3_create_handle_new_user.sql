create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end
$$;

drop trigger if exists set_updated_at_profiles on public.profile;
create trigger set_updated_at_profile
before update on public.profile
for each row execute function public.tg_set_updated_at();

-- 2) Function that inserts a profile after a user is created
-- SECURITY DEFINER so it can insert regardless of RLS
-- (table owner bypasses RLS; make sure this function is owned by the same owner as the table)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert a default profile (id matching auth.users.id)
  insert into public.profile (user_id, name, subscription_plan, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1)),
    'free',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  on conflict (user_id) do nothing;

  return new;
end
$$;

-- 3) Trigger on auth.users AFTER INSERT to call the function above
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();