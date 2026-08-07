// Global search. Queries content tables with ILIKE (fast via pg_trgm GIN
// indexes from migration 0016) and returns typed, normalized, ranked results.
import { supabase } from '../supabaseClient';
import { normalizePrompt } from './prompts';

// Lightweight columns for search result cards (avoids fetching heavy fields).
const SEARCH_PROMPT_COLUMNS = `
  id, slug, title, excerpt, image_url, category_id, author_id,
  trending_until, created_at,
  categories ( id, slug, name ),
  profiles ( id, full_name )
`;

const TRENDING = 'trending';
const NEW = 'new';

const NEW_BADGE_MS = () => Number(import.meta.env.VITE_NEW_BADGE_DAYS || '14') * 24 * 60 * 60 * 1000;

// Human-friendly label for a prompt result.
export function promptBadge(p) {
  if (p.trending_until && new Date(p.trending_until).getTime() > Date.now()) return TRENDING;
  if (p.created_at && Date.now() - new Date(p.created_at).getTime() <= NEW_BADGE_MS()) return NEW;
  return null;
}

// Escape a plain term so it is safe inside an ILIKE pattern.
function like(term) {
  return '%' + String(term).replace(/[%_\\]/g, (m) => '\\' + m) + '%';
}

// Search prompts across their own text fields PLUS the assigned category
// (name/slug) and assigned tags. Uses ILIKE (fast via pg_trgm GIN indexes from
// migrations 0016/0017). Results are ranked: direct text match first, then
// category match, then tag match, each ordered newest-first.
export async function searchPrompts(query, { limit = 6 } = {}) {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  const pattern = like(term);

  const ranked = [];
  const seen = new Set();
  const addRows = (rows) => {
    for (const row of rows || []) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        ranked.push({ ...normalizePrompt(row), badge: promptBadge(row) });
      }
    }
  };

  // 1) Direct match on prompt text fields.
  const textQuery = supabase
    .from('prompts')
    .select(SEARCH_PROMPT_COLUMNS)
    .or(
      `title.ilike.${pattern},excerpt.ilike.${pattern},description.ilike.${pattern},` +
      `image_prompt.ilike.${pattern},video_prompt.ilike.${pattern}`
    )
    .order('created_at', { ascending: false })
    .limit(15);

  // 2) Match on the assigned category's name or slug.
  const catRes = await supabase
    .from('categories')
    .select('id')
    .eq('is_active', true)
    .or(`name.ilike.${pattern},slug.ilike.${pattern}`);
  const catIds = (catRes.data || []).map((c) => c.id);

  // 3) Match on any assigned tag's name.
  const tagRes = await supabase.from('tags').select('id').ilike('name', pattern);
  const tagIds = (tagRes.data || []).map((t) => t.id);
  let tagPromptIds = [];
  if (tagIds.length) {
    const linkRes = await supabase
      .from('prompt_tags')
      .select('prompt_id')
      .in('tag_id', tagIds);
    tagPromptIds = (linkRes.data || []).map((r) => r.prompt_id);
  }

  const categoryQuery = catIds.length
    ? supabase
        .from('prompts')
        .select(SEARCH_PROMPT_COLUMNS)
        .in('category_id', catIds)
        .order('created_at', { ascending: false })
        .limit(12)
    : null;
  const tagQuery = tagPromptIds.length
    ? supabase
        .from('prompts')
        .select(SEARCH_PROMPT_COLUMNS)
        .in('id', tagPromptIds)
        .order('created_at', { ascending: false })
        .limit(12)
    : null;

  const [textRows, catRows, tagRows] = await Promise.all([
    textQuery.then((r) => r.data || []).catch(() => []),
    categoryQuery ? categoryQuery.then((r) => r.data || []).catch(() => []) : [],
    tagQuery ? tagQuery.then((r) => r.data || []).catch(() => []) : [],
  ]);

  addRows(textRows);
  addRows(catRows);
  addRows(tagRows);

  return ranked.slice(0, limit);
}

// Search categories by display name or slug. Only active categories appear.
export async function searchCategories(query, { limit = 4 } = {}) {
  const term = query.trim().toLowerCase();
  if (!term) return [];
  const pattern = like(term);

  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('is_active', true)
    .or(`name.ilike.${pattern},slug.ilike.${pattern}`)
    .order('name', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// Combined "global" search used by the search bar (prompts + categories).
export async function searchEverything(query, { promptLimit = 6, categoryLimit = 4 } = {}) {
  const [prompts, categories] = await Promise.all([
    searchPrompts(query, { limit: promptLimit }),
    searchCategories(query, { limit: categoryLimit }),
  ]);
  return { prompts, categories };
}