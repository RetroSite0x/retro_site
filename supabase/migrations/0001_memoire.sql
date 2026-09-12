-- 0001_memoire.sql
-- Memoire bulletin board — shared retro-styled guestbook for the portfolio.
--
-- Security model:
--   1. The table is public (readable by anyone, no auth required).
--   2. Row-Level Security (RLS) is enabled. Only anon (unauthenticated) INSERT
--      and SELECT are permitted — no UPDATE or DELETE by anyone except superuser.
--   3. Column-level GRANTs ensure the anon role can only INSERT handle and message.
--      id and created_at are set by the database (DEFAULT expressions), so a client
--      cannot spoof another visitor's identity or timestamp.
--   4. CHECK constraints enforce application-level length limits at the DB level,
--      providing a second line of defense beyond the client-side validation.

-- ── Table ─────────────────────────────────────────────────────────────

create table if not exists public.memoire (
  id         uuid primary key default gen_random_uuid(),
  handle     text not null,
  message    text not null,
  created_at timestamptz not null default now(),

  -- Length constraints matching client-side MEMOIRE_MAX_HANDLE (24)
  -- and MEMOIRE_MAX_MESSAGE (400).
  constraint memoire_handle_len  check (char_length(handle) between 1 and 24),
  constraint memoire_message_len check (char_length(message) between 1 and 400)
);

comment on table public.memoire is 'Retro-styled guestbook / bulletin board. Public read, anon insert only.';

-- ── Index ─────────────────────────────────────────────────────────────

-- Supports the default listing query: ORDER BY created_at DESC LIMIT N.
create index if not exists memoire_created_at_idx
  on public.memoire (created_at desc);

-- ── Row-Level Security ────────────────────────────────────────────────

alter table public.memoire enable row level security;

-- Allow anyone (anon) to read all posts.
create policy memoire_read on public.memoire
  for select
  to anon
  using (true);

-- Allow anyone (anon) to insert new posts. The WITH CHECK (true) means any row
-- that passes the INSERT is accepted — the CHECK constraints on the table
-- enforce handle/message length limits.
create policy memoire_insert on public.memoire
  for insert
  to anon
  with check (true);

-- NO update or delete policies exist, so anon cannot modify or remove rows.

-- ── Column-level grants ───────────────────────────────────────────────
-- Revoke all privileges first, then grant the minimum required.
-- This prevents a client from setting id or created_at directly,
-- even if the REST API forwards those columns.

revoke all on public.memoire from anon;

grant select on public.memoire to anon;
grant insert (handle, message) on public.memoire to anon;
