-- File: 009_apply_rls_policies.sql
-- Purpose: Enable RLS and add ownership/security policies for the revised profile, role, facility, wallet, and payment tables.
-- Execution Order: 9
-- Notes:
--   - This migration assumes tables from 001-008 already exist.
--   - Edge Functions or service-role execution remain the path for privileged writes.
--   - Public facility creation, wallet balance writes, payment confirmation, and facility-manager assignment are intentionally not exposed to normal client writes.

-- -------------------------------------------------------------------
-- Enable RLS
-- -------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.account_types enable row level security;
alter table public.player_profiles enable row level security;
alter table public.referee_profiles enable row level security;
alter table public.facilities enable row level security;
alter table public.facility_managers enable row level security;
alter table public.wallet_accounts enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.payment_intents enable row level security;
alter table public.payment_items enable row level security;

-- -------------------------------------------------------------------
-- Drop existing policies if rerun
-- -------------------------------------------------------------------
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

drop policy if exists account_types_select_own on public.account_types;
drop policy if exists account_types_insert_own on public.account_types;

drop policy if exists player_profiles_select_own on public.player_profiles;
drop policy if exists player_profiles_insert_own on public.player_profiles;
drop policy if exists player_profiles_update_own on public.player_profiles;

drop policy if exists referee_profiles_select_own on public.referee_profiles;
drop policy if exists referee_profiles_insert_own on public.referee_profiles;
drop policy if exists referee_profiles_update_own on public.referee_profiles;

drop policy if exists facilities_select_authenticated on public.facilities;

drop policy if exists facility_managers_select_own on public.facility_managers;

drop policy if exists wallet_accounts_select_own on public.wallet_accounts;

drop policy if exists wallet_transactions_select_own on public.wallet_transactions;

drop policy if exists payment_intents_select_own on public.payment_intents;
drop policy if exists payment_intents_insert_own on public.payment_intents;

drop policy if exists payment_items_select_owned_intent on public.payment_items;
drop policy if exists payment_items_insert_owned_intent on public.payment_items;

-- -------------------------------------------------------------------
-- profiles
-- -------------------------------------------------------------------
create policy profiles_select_own
on public.profiles
for select
using (auth.uid() = id);

create policy profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = id);

create policy profiles_update_own
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- -------------------------------------------------------------------
-- account_types
-- -------------------------------------------------------------------
create policy account_types_select_own
on public.account_types
for select
using (auth.uid() = user_id);

create policy account_types_insert_own
on public.account_types
for insert
with check (
  auth.uid() = user_id
  and type in ('player', 'referee', 'facility_manager')
);

-- -------------------------------------------------------------------
-- player_profiles
-- -------------------------------------------------------------------
create policy player_profiles_select_own
on public.player_profiles
for select
using (auth.uid() = user_id);

create policy player_profiles_insert_own
on public.player_profiles
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.account_types at
    where at.user_id = auth.uid()
      and at.type = 'player'
  )
);

create policy player_profiles_update_own
on public.player_profiles
for update
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.account_types at
    where at.user_id = auth.uid()
      and at.type = 'player'
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.account_types at
    where at.user_id = auth.uid()
      and at.type = 'player'
  )
);

-- -------------------------------------------------------------------
-- referee_profiles
-- -------------------------------------------------------------------
create policy referee_profiles_select_own
on public.referee_profiles
for select
using (auth.uid() = user_id);

create policy referee_profiles_insert_own
on public.referee_profiles
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.account_types at
    where at.user_id = auth.uid()
      and at.type = 'referee'
  )
);

create policy referee_profiles_update_own
on public.referee_profiles
for update
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.account_types at
    where at.user_id = auth.uid()
      and at.type = 'referee'
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.account_types at
    where at.user_id = auth.uid()
      and at.type = 'referee'
  )
);

-- -------------------------------------------------------------------
-- facilities
-- -------------------------------------------------------------------
create policy facilities_select_authenticated
on public.facilities
for select
using (auth.uid() is not null);

-- -------------------------------------------------------------------
-- facility_managers
-- -------------------------------------------------------------------
create policy facility_managers_select_own
on public.facility_managers
for select
using (auth.uid() = user_id);

-- -------------------------------------------------------------------
-- wallet_accounts
-- -------------------------------------------------------------------
create policy wallet_accounts_select_own
on public.wallet_accounts
for select
using (auth.uid() = user_id);

-- -------------------------------------------------------------------
-- wallet_transactions
-- -------------------------------------------------------------------
create policy wallet_transactions_select_own
on public.wallet_transactions
for select
using (auth.uid() = user_id);

-- -------------------------------------------------------------------
-- payment_intents
-- -------------------------------------------------------------------
create policy payment_intents_select_own
on public.payment_intents
for select
using (auth.uid() = user_id);

create policy payment_intents_insert_own
on public.payment_intents
for insert
with check (auth.uid() = user_id);

-- -------------------------------------------------------------------
-- payment_items
-- -------------------------------------------------------------------
create policy payment_items_select_owned_intent
on public.payment_items
for select
using (
  exists (
    select 1
    from public.payment_intents pi
    where pi.id = payment_items.payment_intent_id
      and pi.user_id = auth.uid()
  )
);

create policy payment_items_insert_owned_intent
on public.payment_items
for insert
with check (
  exists (
    select 1
    from public.payment_intents pi
    where pi.id = payment_items.payment_intent_id
      and pi.user_id = auth.uid()
  )
);

-- -------------------------------------------------------------------
-- Documentation comments
-- -------------------------------------------------------------------
comment on table public.account_types is 'RLS enabled: users can read and insert only their own account types.';
comment on table public.player_profiles is 'RLS enabled: users can manage only their own player profile when player role exists.';
comment on table public.referee_profiles is 'RLS enabled: users can manage only their own referee profile when referee role exists.';
comment on table public.facilities is 'RLS enabled: authenticated users can read; writes remain server or admin workflow only.';
comment on table public.facility_managers is 'RLS enabled: users can read only their own facility-manager relations.';
comment on table public.wallet_accounts is 'RLS enabled: users can read only their own wallet account. Client writes blocked.';
comment on table public.wallet_transactions is 'RLS enabled: users can read only their own wallet ledger. Client writes blocked.';
comment on table public.payment_intents is 'RLS enabled: users can create and read only their own payment intents. Client updates blocked.';
comment on table public.payment_items is 'RLS enabled: users can read and insert only items attached to their own payment intents.';
