-- 0007_trending.sql
-- Automatic trending, computed from engagement metrics.
-- A scheduled job (Supabase Cron / pg_cron / scheduled Edge Function)
-- calls public.refresh_trending(); the badge shows only while
-- trending_until is in the future, and disappears automatically.

create or replace function public.refresh_trending(p_window_days int default 14)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_updated int;
begin
  -- 1) Expire stale trending flags.
  update public.prompts
     set trending_until = null
   where trending_until is not null
     and trending_until < now();

  -- 2) Score recent prompts by recency-weighted engagement
  --    (likes > saves > shares > copies > views), pick the top few.
  with scored as (
    select
      p.id,
      ( coalesce(p.like_count, 0) * 5.0
      + coalesce(p.save_count, 0) * 4.0
      + coalesce(p.share_count, 0) * 3.0
      + coalesce(p.copy_count, 0) * 2.0
      + coalesce(p.view_count, 0) * 0.1 ) as score
    from public.prompts p
    where p.created_at > now() - (p_window_days || ' days')::interval
  )
  update public.prompts p
     set trending_until = now() + interval '48 hours'
   where p.id in (
          select id from scored where score >= 1 order by score desc limit 12
        );

  get diagnostics v_updated = row_count;
  return v_updated;
end $$;

-- Convenience for scheduling from Supabase Dashboard's Cron page:
--   select public.refresh_trending(14);
-- or as a pg_cron job:
--   select cron.schedule('refresh-trending', '0 * * * *', $$select public.refresh_trending(14)$$);