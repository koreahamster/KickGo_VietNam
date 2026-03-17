-- File: 007_add_constraints_and_indexes.sql
-- Purpose: Add indexes, transition foreign keys, and safe constraints after the initial backfill.
-- Execution Order: 7
-- Notes:
--   - Do not drop legacy columns here.
--   - Do not enforce province_code or district_code NOT NULL yet.
--   - Do not enforce player role existence through hard database triggers in this migration.

create index if not exists idx_account_types_user_id
  on public.account_types(user_id);

create index if not exists idx_account_types_type
  on public.account_types(type);

create index if not exists idx_facility_managers_facility_id
  on public.facility_managers(facility_id);

create index if not exists idx_wallet_transactions_user_id_created_at
  on public.wallet_transactions(user_id, created_at desc);

create index if not exists idx_payment_intents_user_id_created_at
  on public.payment_intents(user_id, created_at desc);

create index if not exists idx_payment_items_payment_intent_id
  on public.payment_items(payment_intent_id)
  where payment_intent_id is not null;

create index if not exists idx_profiles_country_province_district
  on public.profiles(country_code, province_code, district_code);

create index if not exists idx_facilities_country_province_district
  on public.facilities(country_code, province_code, district_code);

alter table public.payment_items
  drop constraint if exists payment_items_payment_intent_id_fkey;

alter table public.payment_items
  add constraint payment_items_payment_intent_id_fkey
  foreign key (payment_intent_id)
  references public.payment_intents(id)
  on delete cascade;
