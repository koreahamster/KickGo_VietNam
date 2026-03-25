-- File: 011_apply_user_devices_and_avatar_storage_policies.sql
-- Purpose: Prepare RLS for user_devices and create the avatars storage bucket/policies required by KickGo v3.1.
-- Execution Order: 11
-- Notes:
--   - Run after 010_create_user_devices.sql.
--   - The avatars bucket is public-read, but write access is limited to each user's own folder.
--   - upload-avatar Edge Function still remains the only supported application path for avatar_url updates.

alter table public.user_devices enable row level security;

drop policy if exists user_devices_select_own on public.user_devices;
drop policy if exists user_devices_insert_own on public.user_devices;
drop policy if exists user_devices_update_own on public.user_devices;

create policy user_devices_select_own
on public.user_devices
for select
using (auth.uid() = user_id);

create policy user_devices_insert_own
on public.user_devices
for insert
with check (auth.uid() = user_id);

create policy user_devices_update_own
on public.user_devices
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avatars_select_public on storage.objects;
drop policy if exists avatars_insert_own on storage.objects;
drop policy if exists avatars_update_own on storage.objects;
drop policy if exists avatars_delete_own on storage.objects;

create policy avatars_select_public
on storage.objects
for select
using (bucket_id = 'avatars');

create policy avatars_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy avatars_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy avatars_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

comment on table public.user_devices is 'RLS enabled: users can manage only their own registered devices.';