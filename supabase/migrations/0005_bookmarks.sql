-- 0005_bookmarks.sql
-- Bookmark / save system. One row per (user, prompt) => no duplicates.
create table if not exists public.bookmarks (
  id bigserial primary key,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (prompt_id, user_id)
);

create index if not exists idx_bookmarks_user
  on public.bookmarks (user_id);
create index if not exists idx_bookmarks_prompt
  on public.bookmarks (prompt_id);

-- Keep prompts.save_count in sync.
create or replace function public.sync_save_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.prompts set save_count = save_count + 1 where id = new.prompt_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.prompts set save_count = greatest(save_count - 1, 0) where id = old.prompt_id;
    return old;
  end if;
  return null;
end $$;

drop trigger if exists trg_sync_save_count on public.bookmarks;
create trigger trg_sync_save_count
  after insert or delete on public.bookmarks
  for each row execute function public.sync_save_count();

-- Share count is incremented via RPC (no table needed).
create or replace function public.increment_share_count(p_prompt_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.prompts set share_count = share_count + 1 where id = p_prompt_id;
$$;