-- 0018_remove_subjects.sql
-- Remove the Subject dimension entirely. Subject (gender/format) is now
-- modelled as tags + categories, both of which are fully admin-managed.
-- Additive/idempotent for migration safety; only drops the legacy subject
-- system (never touches the contact form's unrelated "subject" column).

drop index if exists public.idx_prompts_subject;

-- Dropping the column also drops its FK to public.subjects.
alter table public.prompts drop column if exists subject_id;

drop table if exists public.subjects;