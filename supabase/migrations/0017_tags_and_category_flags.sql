-- 0017_tags_and_category_flags.sql
-- Flexible creative-output taxonomy.
--   * Tags: an admin-managed, searchable attribute dimension per prompt
--     (STYLE / SUBJECT / TECHNIQUE / etc.). Categories stay the "what you're
--     creating", tags describe attributes.
--   * prompt_tags: many-to-many junction (a prompt can carry many tags).
--   * categories.description + categories.is_active: optional per-category
--     description and soft activate/deactivate (deactivated categories drop
--     out of public-facing browse/search/filter lists without touching data).
-- Additive + idempotent. Apply from Supabase SQL Editor. Creates NO categories.

-- ── Tags ──
create table if not exists public.tags (
  id bigserial primary key,
  slug text not null unique,
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ── Junction: prompt ↔ tag ──
create table if not exists public.prompt_tags (
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  tag_id bigint not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (prompt_id, tag_id)
);

create index if not exists idx_prompt_tags_tag on public.prompt_tags (tag_id);
create index if not exists idx_prompt_tags_prompt on public.prompt_tags (prompt_id);

-- ── Category flags ──
alter table public.categories
  add column if not exists description text;
alter table public.categories
  add column if not exists is_active boolean not null default true;

-- Refresh the stats view so it carries description + is_active (frontends use
-- this view for Browse by Style + dynamic homepage filters).
create or replace view public.category_stats
with (security_invoker = true) as
  select
    c.id,
    c.slug,
    c.name,
    c.description,
    c.is_active,
    c.sort_order,
    c.parent_id,
    count(p.id)::int as prompt_count
  from public.categories c
  left join public.prompts p on p.category_id = c.id
  group by c.id, c.slug, c.name, c.description, c.is_active, c.sort_order, c.parent_id;

-- ── Search indexes (pg_trgm) ──
create extension if not exists pg_trgm;
create index if not exists idx_tags_search_name on public.tags using gin (name gin_trgm_ops);
create index if not exists idx_tags_search_slug on public.tags using gin (slug gin_trgm_ops);

-- ── RLS ──
alter table public.tags enable row level security;
alter table public.prompt_tags enable row level security;

do $$ begin
  create policy "Tags: public read" on public.tags
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Tags: admins manage" on public.tags
    for all using (public.is_admin()) with check (public.is_admin());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "prompt_tags: public read" on public.prompt_tags
    for select using (true);
exception when duplicate_object then null; end $$;

-- Anyone can attach/detach tags to a prompt via the junction (matches the
-- per-device/like model; abused rows are harmless and admin-curated).
do $$ begin
  create policy "prompt_tags: all can link" on public.prompt_tags
    for all using (true) with check (true);
exception when duplicate_object then null; end $$;