-- File: 014_add_user_consents_update_policy.sql
-- Purpose: Allow authenticated users to update their own consent rows via record-consent.
-- Execution Order: 14

alter table public.user_consents enable row level security;

drop policy if exists user_consents_update on public.user_consents;
create policy user_consents_update
on public.user_consents
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);