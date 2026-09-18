-- 0002_visitor_counter.sql
-- Atomic visitor counter — one row, incremented via RPC on each boot.

create table if not exists public.visitor_counter (
  id    int primary key default 1,
  count bigint not null default 0,
  constraint visitor_counter_single_row check (id = 1)
);

insert into public.visitor_counter (id, count)
values (1, 42819)
on conflict (id) do nothing;

alter table public.visitor_counter enable row level security;

create policy visitor_counter_read on public.visitor_counter
  for select to anon using (true);

revoke all on public.visitor_counter from anon;
grant select on public.visitor_counter to anon;

create or replace function public.increment_visitor_count()
returns bigint
language sql
security definer
as $$
  update public.visitor_counter
  set count = count + 1
  where id = 1
  returning count;
$$;

grant execute on function public.increment_visitor_count() to anon;
