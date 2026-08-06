-- 0012_categories_library.sql
-- Ensures the full 20-category library exists as top-level categories.
-- Idempotent: safe to re-run. Resets these to top-level (parent_id = NULL).
insert into public.categories (slug, name, sort_order, parent_id) values
  ('portraits',            'Portraits',            1,  null),
  ('fashion-editorial',    'Fashion & Editorial',  2,  null),
  ('photograph',           'Photograph',           3,  null),
  ('lifestyle',            'Lifestyle',            4,  null),
  ('cinematic',            'Cinematic',            5,  null),
  ('digital-art',          'Digital Art',          6,  null),
  ('men',                  'Men',                  7,  null),
  ('character-design',     'Character Design',     8,  null),
  ('digital-illustration', 'Digital Illustration', 9,  null),
  ('illustration',         'Illustration',         10, null),
  ('style',                'Style',                11, null),
  ('business-professional','Business & Professional', 12, null),
  ('portrait-photography', 'Portrait Photography', 13, null),
  ('mens-fashion',         'Men\u2019s Fashion',   14, null),
  ('people',               'People',               15, null),
  ('studio-photography',   'Studio Photography',   16, null),
  ('realistic',            'Realistic',            17, null),
  ('fine-art',             'Fine Art',             18, null),
  ('black-white',          'Black & White',        19, null),
  ('photoshoot',           'Photoshoot',           20, null)
on conflict (slug) do update
  set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;
