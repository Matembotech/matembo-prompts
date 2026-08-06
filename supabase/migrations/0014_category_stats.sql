-- 0014_category_stats.sql
-- Real per-category prompt counts for the "Browse by Style" section.
-- security_invoker lets RLS on the underlying tables apply (public read).
create or replace view public.category_stats
with (security_invoker = true) as
  select
    c.id,
    c.slug,
    c.name,
    c.sort_order,
    c.parent_id,
    count(p.id)::int as prompt_count
  from public.categories c
  left join public.prompts p on p.category_id = c.id
  group by c.id, c.slug, c.name, c.sort_order, c.parent_id;