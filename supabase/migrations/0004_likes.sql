-- 0004_likes.sql
-- Like system. One row per (user, prompt) => no duplicate likes.
create table if not exists public.likes (
  id bigserial primary key,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (prompt_id, user_id)
);

create index if not exists idx_likes_user
  on public.likes (user_id);
create index if not exists idx_likes_prompt
  on public.likes (prompt_id);

-- Keep prompts.like_count in sync (single source of truth = likes table).
create or replace function public.sync_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.prompts set like_count = like_count + 1 where id = new.prompt_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.prompts set like_count = greatest(like_count - 1, 0) where id = old.prompt_id;
    return old;
  end if;
  return null;
end $$;

drop trigger if exists trg_sync_like_count on public.likes;
create trigger trg_sync_like_count
  after insert or delete on public.likes
  for each row execute function public.sync_like_count();