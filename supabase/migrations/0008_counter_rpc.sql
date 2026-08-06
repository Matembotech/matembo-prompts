-- 0008_counter_rpc.sql
-- After RLS is enabled, anonymous visitors can no longer UPDATE prompts
-- directly (previously they bumped view_count / copy_count via anon key).
-- This security-definer RPC lets any visitor increment ONLY whitelisted
-- counters, keeping existing counting behavior without exposing writes.
-- like_count / save_count are excluded: they are maintained by triggers.

create or replace function public.increment_counter(
  p_table text,
  p_column text,
  p_id uuid,
  p_amount int default 1
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_sql text;
begin
  if p_table <> 'prompts' then
    raise exception 'invalid table';
  end if;
  if p_column not in ('view_count', 'copy_count', 'share_count') then
    raise exception 'invalid column';
  end if;
  if p_amount < 0 or p_amount > 10 then
    raise exception 'invalid amount';
  end if;
  v_sql := format(
    'update public.%I set %I = %I + %L where id = %L',
    p_table, p_column, p_column, p_amount, p_id
  );
  execute v_sql;
end $$;

revoke execute on function public.increment_counter(text, text, uuid, int) from public;
grant execute on function public.increment_counter(text, text, uuid, int) to anon, authenticated;
