-- Migration: Create members and expenses tables for shared expense tracking
-- Affected tables: members, expenses
-- Special: RLS enabled on both tables

-- Members table: maps auth users to display names
create table public.members (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

comment on table public.members is 'Roommates of 1909. Maps auth users to display names via email.';

alter table public.members enable row level security;

create policy "Authenticated users can view all members"
on public.members
for select
to authenticated
using (true);

-- Expenses table: each record is a shared expense paid by one member, split equally
create table public.expenses (
  id bigint generated always as identity primary key,
  member_id bigint not null references public.members(id),
  title text not null,
  amount integer not null,
  settled boolean default false,
  created_at timestamptz default now()
);

comment on table public.expenses is 'Shared household expenses. Each expense is split equally among all members.';

alter table public.expenses enable row level security;

create index idx_expenses_member_id on public.expenses using btree (member_id);
create index idx_expenses_settled on public.expenses using btree (settled);

create policy "Authenticated users can view all expenses"
on public.expenses
for select
to authenticated
using (true);

create policy "Members can insert their own expenses"
on public.expenses
for insert
to authenticated
with check (
  member_id = (
    select members.id
    from public.members
    where members.email = (select auth.jwt() ->> 'email')
  )
);

create policy "Authenticated users can update expenses"
on public.expenses
for update
to authenticated
using (true)
with check (true);
