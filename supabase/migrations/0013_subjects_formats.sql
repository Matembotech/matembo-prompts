-- 0013_subjects_formats.sql
-- Add design-format subjects (Posters, Flyers, Logo) alongside the
-- gender/audience subjects. Idempotent and additive.
insert into public.subjects (slug, name, sort_order) values
  ('posters', 'Posters', 5),
  ('flyers',  'Flyers',  6),
  ('logo',    'Logo',    7)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;