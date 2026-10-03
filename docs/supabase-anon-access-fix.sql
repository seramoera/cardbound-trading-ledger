-- Run this in the Supabase SQL editor after the profiles, partners, and
-- trade_history tables exist. It removes anonymous table access, replaces
-- existing policies with owner-scoped policies, and keeps signup's username
-- availability check working through a narrow RPC.

begin;

alter table public.profiles enable row level security;
alter table public.partners enable row level security;
alter table public.trade_history enable row level security;

-- Remove any older permissive policies before applying the current policy set.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'partners', 'trade_history')
  loop
    execute format(
      'drop policy %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end
$$;

create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = id);

create policy profiles_insert_own
  on public.profiles for insert
  with check (auth.uid() = id);

create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy partners_all_own
  on public.partners for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy trade_history_all_own
  on public.trade_history for all
  using (
    auth.uid() = owner_id
    and (
      partner_id is null
      or exists (
        select 1
        from public.partners
        where partners.id = trade_history.partner_id
          and partners.owner_id = auth.uid()
      )
    )
  )
  with check (
    auth.uid() = owner_id
    and (
      partner_id is null
      or exists (
        select 1
        from public.partners
        where partners.id = trade_history.partner_id
          and partners.owner_id = auth.uid()
      )
    )
  );

-- The browser must not read or mutate these tables using the anon role.
revoke all privileges on table
  public.profiles,
  public.partners,
  public.trade_history
from anon, public, authenticated;

-- Authenticated app operations only; RLS limits them to the current user's rows.
grant select, insert, update
  on table public.profiles to authenticated;

grant select, insert, update, delete
  on table public.partners to authenticated;

grant select, insert, update, delete
  on table public.trade_history to authenticated;

-- Signup can check one username without granting anon access to profile rows.
create or replace function public.is_username_available(requested_username text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select not exists (
    select 1
    from public.profiles as profile
    where profile.username = requested_username
  );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

commit;
