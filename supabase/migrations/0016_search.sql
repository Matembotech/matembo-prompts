-- 0016_search.sql
-- Global search support. Enables fast partial-word (ILIKE) text search across
-- prompt text and category names using Postgres trigram GIN indexes.
-- All additive / idempotent. Requires superuser or a project where CREATE
-- EXTENSION is permitted (standard on Supabase).

create extension if not exists pg_trgm;

-- Prompts: search over content + metadata text.
create index if not exists idx_prompts_search_title
  on public.prompts using gin (title gin_trgm_ops);
create index if not exists idx_prompts_search_excerpt
  on public.prompts using gin (excerpt gin_trgm_ops);
create index if not exists idx_prompts_search_description
  on public.prompts using gin (description gin_trgm_ops);
create index if not exists idx_prompts_search_image_prompt
  on public.prompts using gin (image_prompt gin_trgm_ops);
create index if not exists idx_prompts_search_video_prompt
  on public.prompts using gin (video_prompt gin_trgm_ops);

-- Categories: search by display name.
create index if not exists idx_categories_search_name
  on public.categories using gin (name gin_trgm_ops);