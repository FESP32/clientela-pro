drop trigger if exists set_profiles_updated_at on public.profile;
create trigger set_profiles_updated_at
before update on public.profile
for each row
execute procedure public.set_updated_at();

-- drop trigger if exists set_subscription_plan_updated_at on public.subscription_plan;
-- create trigger set_subscription_plan_updated_at
-- before update on public.subscription_plan
-- for each row 
-- execute procedure public.set_updated_at();

drop trigger if exists set_subscription_updated_at on public.subscription;
create trigger set_subscription_updated_at
before update on public.subscription
for each row 
execute procedure public.set_updated_at();

drop trigger if exists set_business_updated_at on public.business;
create trigger set_business_updated_at
before update on public.business
for each row 
execute procedure public.set_updated_at();

drop trigger if exists set_business_invite_updated_at on public.business_invite;
create trigger set_business_invite_updated_at
before update on public.business_invite
for each row 
execute procedure public.set_updated_at();

drop trigger if exists set_product_updated_at on public.product;
create trigger set_product_updated_at
before update on public.product
for each row 
execute procedure public.set_updated_at();

drop trigger if exists set_survey_updated_at on public.survey;
create trigger set_survey_updated_at
before update on public.survey
for each row 
execute procedure public.set_updated_at();

drop trigger if exists set_stamp_intent_updated_at on public.stamp_intent;
create trigger set_stamp_intent_updated_at
before update on public.stamp_intent
for each row 
execute procedure public.set_updated_at();

drop trigger if exists set_stamp_card_updated_at on public.stamp_card;
create trigger set_stamp_card_updated_at
before update on public.stamp_card
for each row 
execute procedure public.set_updated_at();

drop trigger if exists set_referral_program_updated_at on public.referral_program;
create trigger set_referral_program_updated_at
before update on public.referral_program
for each row 
execute procedure public.set_updated_at();

drop trigger if exists set_referral_program_participant_updated_at on public.referral_program_participant;
create trigger set_referral_program_participant_updated_at
before update on public.referral_program_participant
for each row 
execute procedure public.set_updated_at();

drop trigger if exists set_referral_intent_updated_at on public.referral_intent;
create trigger set_referral_intent_updated_at
before update on public.referral_intent
for each row 
execute procedure public.set_updated_at();

drop trigger if exists set_gift_updated_at on public.gift;
create trigger set_gift_updated_at
before update on public.gift
for each row 
execute procedure public.set_updated_at();

create trigger trig_set_consumed_at_gift_intent
before update on public.gift_intent
for each row 
execute procedure public.gift_intent_set_consumed_at();

create trigger set_gift_intent_updated_at
before update on public.gift_intent
for each row 
execute procedure public.set_updated_at();



