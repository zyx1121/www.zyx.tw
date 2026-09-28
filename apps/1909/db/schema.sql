-- 1909 shared expenses, in the shared zyx-tw Neon database.
-- Apply with the unpooled URL: psql "$DATABASE_URL_UNPOOLED" -f apps/1909/db/schema.sql
-- There is no RLS: lib/member.ts and app/actions.ts check the flatmate.
-- Ids are integer so the Neon driver returns numbers (it returns int8 as text).
create schema if not exists app_1909;

create table if not exists app_1909.members (
  id integer generated always as identity primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

create table if not exists app_1909.expenses (
  id integer generated always as identity primary key,
  member_id integer not null references app_1909.members (id),
  title text not null,
  amount integer not null,
  settled boolean default false,
  created_at timestamptz default now()
);

create index if not exists expenses_member_id_idx on app_1909.expenses (member_id);
create index if not exists expenses_settled_idx on app_1909.expenses (settled);
