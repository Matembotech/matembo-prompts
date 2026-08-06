-- 0002_categories.sql
-- Prompt categories: stored in DB, never hardcoded in the client.
-- These are the site's general categories / libraries.
create table if not exists public.categories (
  id bigserial primary key,
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Seed the full category library. ON CONFLICT updates the display name so an
-- existing DB can be refreshed by re-running this statement.
insert into public.categories (slug, name, sort_order) values
  ('portraits',           'Portraits',                   1),
  ('fashion-editorial',   'Fashion & Editorial',         2),
  ('photograph',          'Photograph',                  3),
  ('lifestyle',           'Lifestyle',                   4),
  ('cinematic',           'Cinematic',                   5),
  ('digital-art',         'Digital Art',                 6),
  ('men',                 'Men',                         7),
  ('character-design',    'Character Design',            8),
  ('digital-illustration','Digital Illustration',        9),
  ('illustration',        'Illustration',               10),
  ('style',               'Style',                      11),
  ('business-professional','Business & Professional',   12),
  ('portrait-photography','Portrait Photography',       13),
  ('mens-fashion',        'Men\u2019s Fashion',          14),
  ('people',              'People',                     15),
  ('studio-photography',  'Studio Photography',         16),
  ('realistic',           'Realistic',                  17),
  ('fine-art',            'Fine Art',                   18),
  ('black-white',         'Black & White',              19),
  ('photoshoot',          'Photoshoot',                 20)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;