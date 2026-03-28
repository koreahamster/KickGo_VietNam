-- File: 032_create_get_my_bootstrap_rpc.sql
-- Purpose: Aggregate the current authenticated user's bootstrap data in a single RPC.

create or replace function public.get_my_bootstrap()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'profile', (
      select row_to_json(p)
      from public.profiles p
      where p.id = auth.uid()
    ),
    'account_types', (
      select json_agg(a.type)
      from public.account_types a
      where a.user_id = auth.uid()
    ),
    'player_profile', (
      select row_to_json(pp)
      from public.player_profiles pp
      where pp.user_id = auth.uid()
    ),
    'referee_profile', (
      select row_to_json(rp)
      from public.referee_profiles rp
      where rp.user_id = auth.uid()
    )
  )
$$;

grant execute on function public.get_my_bootstrap() to authenticated;