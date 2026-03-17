-- File: 008_prepare_rls_tables.sql
-- Purpose: Finalize table metadata so the next migration can focus only on RLS policies.
-- Execution Order: 8
-- Notes:
--   - This migration intentionally does not enable RLS or create policies yet.
--   - Legacy profile fields and primary_region_code remain in place until app/server migration is complete.

comment on table public.profiles is 'Common profile table after v1.4 revision. Legacy player columns remain temporarily for gradual migration.';
comment on table public.account_types is 'Prepared for upcoming RLS policies. Ownership is user_id.';
comment on table public.player_profiles is 'Prepared for upcoming RLS policies. Ownership is user_id.';
comment on table public.referee_profiles is 'Prepared for upcoming RLS policies. Ownership is user_id.';
comment on table public.facilities is 'Prepared for upcoming RLS policies. Public creation remains disabled by workflow.';
comment on table public.facility_managers is 'Prepared for upcoming RLS policies. Relation ownership and approval policy to be added next.';
comment on table public.wallet_accounts is 'Prepared for upcoming RLS policies. Client direct balance modification must remain blocked.';
comment on table public.wallet_transactions is 'Prepared for upcoming RLS policies. Server-verified writes only.';
comment on table public.payment_intents is 'Prepared for upcoming RLS policies. State transitions must remain server-controlled.';
comment on table public.payment_items is 'Prepared for upcoming RLS policies and gradual payment_intent transition.';

select 1;
