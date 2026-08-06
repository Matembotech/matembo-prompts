-- 0003_prompt_columns.sql
-- Additive columns for the prompt enhancement features.
-- All nullable/defaulted so existing rows and queries keep working.
alter table public.prompts
  add column if not exists category_id bigint references public.categories(id) on delete set null,
  add column if not exists author_id uuid references public.profiles(id) on delete set null,
  add column if not exists excerpt text,
  add column if not exists like_count int not null default 0,
  add column if not exists save_count int not null default 0,
  add column if not exists share_count int not null default 0,
  add column if not exists trending_until timestamptz;

-- Indexes for the new query paths.
create index if not exists idx_prompts_category
  on public.prompts (category_id);
create index if not exists idx_prompts_author
  on public.prompts (author_id);
create index if not exists idx_prompts_created
  on public.prompts (created_at desc);
create index if not exists idx_prompts_trending
  on public.prompts (trending_until)
  where trending_until is not null;