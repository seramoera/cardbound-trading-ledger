-- Run in the Supabase SQL editor. This stores the same trade rows for every
-- signed-in client, regardless of device or viewport.

create table if not exists public.trade_history (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  partner_id uuid not null references public.partners(id) on delete cascade,
  list_name text not null check (list_name in ('fromPartner', 'fromUser')),
  card_id text not null,
  card_data jsonb not null,
  quantity integer not null default 1 check (quantity > 0),
  is_traded boolean not null default false,
  traded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (owner_id, partner_id, list_name, card_id)
);

create index if not exists trade_history_owner_partner_idx
  on public.trade_history (owner_id, partner_id);

alter table public.trade_history enable row level security;

drop policy if exists trade_history_all_own on public.trade_history;
create policy trade_history_all_own
  on public.trade_history
  for all
  using (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.partners
      where partners.id = trade_history.partner_id
        and partners.owner_id = auth.uid()
    )
  )
  with check (
    auth.uid() = owner_id
    and exists (
      select 1
      from public.partners
      where partners.id = trade_history.partner_id
        and partners.owner_id = auth.uid()
    )
  );
