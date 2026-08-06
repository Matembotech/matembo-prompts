// Supabase Edge Function: refresh-trending
// Recomputes trending_until for prompts. Schedule this via Supabase Dashboard
// (Database -> Cron -> "refresh-trending" every 1h) or via pg_cron.
//
//   deno run ... (Dev)
//   npx supabase functions deploy refresh-trending --use-migrations
//
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const { data, error } = await supabase.rpc('refresh_trending', {
    p_window_days: 14,
  });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, trendingPrompts: data }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
});