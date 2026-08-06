-- 0011_subject_column.sql
-- Attach a single (nullable) subject to prompts. Old rows simply get NULL.
alter table public.prompts
  add column if not exists subject_id bigint references public.subjects(id) on delete set null;

create index if not exists idx_prompts_subject
  on public.prompts (subject_id)
  where subject_id is not null;