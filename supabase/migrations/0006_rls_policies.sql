-- 0006_rls_policies.sql
-- Row Level Security. Enables Supabase Auth (Option A) while keeping the
-- marketplace public/read-only for anonymous visitors.
-- Apply AFTER 0001-0005.

-- Helper: is the current session an admin profile?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.prompts enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;

-- ---------------- PROFILES ----------------
create policy "Profiles are publicly viewable" on public.profiles
  for select using (true);

create policy "Users update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Admins manage all profiles" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------- CATEGORIES ----------------
create policy "Categories: public read" on public.categories
  for select using (true);

create policy "Categories: admins manage" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------- PROMPTS ----------------
create policy "Prompts: public read" on public.prompts
  for select using (true);

create policy "Prompts: admins manage" on public.prompts
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------- LIKES ----------------
create policy "Likes: public read" on public.likes
  for select using (true);

create policy "Likes: users like/unlike their own" on public.likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Likes: admins manage" on public.likes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------- BOOKMARKS ----------------
create policy "Bookmarks: users read their own" on public.bookmarks
  for select using (auth.uid() = user_id);

create policy "Bookmarks: users save/unsave their own" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Bookmarks: admins read all" on public.bookmarks
  for select using (public.is_admin());

-- ---------------- SHARE COUNT RPC ----------------
-- Public can bump share_count (low-stakes metric) via a security definer RPC.
revoke execute on function public.increment_share_count(uuid) from public;
grant execute on function public.increment_share_count(uuid) to anon, authenticated;