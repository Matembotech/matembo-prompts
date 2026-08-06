-- 0009_subjects.sql
-- Subjects (gender / audience) as a global dimension on prompts.
-- A prompt picks ONE subject (nullable) alongside its category, so the same
-- library (e.g. Portrait, Fashion) can be filtered for Men / Women / Children.
create table if not exists public.subjects (
  id bigserial primary key,
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Seed the subject library. ON CONFLICT refreshes display name + order.
insert into public.subjects (slug, name, sort_order) values
  ('men',      'Men',       1),
  ('women',    'Women',     2),
  ('children', 'Children',  3),
  ('unisex',   'Unisex',    4)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- RLS: public read, admins manage (mirrors categories).
alter table public.subjects enable row level security;

create policy "Subjects: public read" on public.subjects
  for select using (true);

create policy "Subjects: admins manage" on public.subjects
  for all using (public.is_admin()) with check (public.is_admin());
