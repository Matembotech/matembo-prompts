-- 0015_contact_messages.sql
-- Contact form submissions received via /contact and reviewed in the admin dashboard.

create table if not exists public.contact_messages (
  id bigserial primary key,
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_created_at
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

-- Visitors may submit new messages.
create policy "Contact: public insert" on public.contact_messages
  for insert with check (true);

-- Only admins can read submissions (privacy: don't expose emails publicly).
create policy "Contact messages: admins read" on public.contact_messages
  for select using (public.is_admin());

create policy "Contact messages: admins manage" on public.contact_messages
  for delete using (public.is_admin());