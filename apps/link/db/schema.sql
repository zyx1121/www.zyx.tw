-- link.zyx.tw short links, in the shared zyx-tw Neon database.
-- Apply with the unpooled URL: psql "$DATABASE_URL_UNPOOLED" -f apps/link/db/schema.sql
create schema if not exists link;

create table if not exists link.redirects (
  short_code text primary key,
  url text not null,
  created_at timestamptz not null default now()
);
