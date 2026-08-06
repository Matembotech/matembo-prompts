-- 0010_category_hierarchy.sql
-- Allow subcategories (parent/child) so formats like Posters/Flyers live
-- under their library (e.g. Business & Professional).
alter table public.categories
  add column if not exists parent_id bigint references public.categories(id) on delete cascade;

create index if not exists idx_categories_parent
  on public.categories (parent_id)
  where parent_id is not null;

-- Seed Business & Professional subcategories. Additive; ON CONFLICT refreshes.
insert into public.categories (slug, name, sort_order, parent_id)
select  s.slug, s.name, s.sort_order, p.id
from (
  values
    ('business-posters',    'Posters',        1),
    ('business-flyers',     'Flyers',         2),
    ('business-brochures',  'Brochures',      3),
    ('business-cards',      'Business Cards', 4)
) as s(slug, name, sort_order)
join public.categories p on p.slug = 'business-professional'
on conflict (slug) do update
  set name = excluded.name, sort_order = excluded.sort_order, parent_id = excluded.parent_id;