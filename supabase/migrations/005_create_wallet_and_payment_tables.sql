-- File: 005_create_wallet_and_payment_tables.sql
-- Purpose: Add wallet and payment-intent structures while preserving existing payment references.
-- Execution Order: 5
-- Notes:
--   - wallet_accounts.balance is a display value only.
--   - wallet_transactions is the ledger source of truth.
--   - payment_items keeps legacy references; payment_intent_id is added for gradual transition.

create table if not exists public.wallet_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance numeric(18,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  amount numeric(18,2) not null,
  status text not null,
  provider text,
  provider_tx_id text,
  created_at timestamptz not null default now(),
  constraint wallet_transactions_type_check check (type in ('deposit', 'match_fee', 'refund', 'facility_payment')),
  constraint wallet_transactions_status_check check (status in ('pending', 'confirmed', 'failed'))
);

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(18,2) not null,
  currency text not null default 'VND',
  status text not null,
  created_at timestamptz not null default now(),
  constraint payment_intents_status_check check (status in ('created', 'pending', 'paid', 'expired', 'failed'))
);

comment on table public.wallet_accounts is 'Current wallet balance display. Ledger truth is wallet_transactions.';
comment on table public.wallet_transactions is 'Wallet ledger entries created only by server-verified flows.';
comment on table public.payment_intents is 'Payment request unit grouping one or more payment items.';

alter table public.payment_items
  add column if not exists payment_intent_id uuid;

comment on column public.payment_items.payment_intent_id is 'New payment_intents reference for gradual migration from legacy payment linkage.';
