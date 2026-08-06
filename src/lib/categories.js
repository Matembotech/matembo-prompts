// Category data access. Categories always come from the database (never
// hardcoded in the UI), with an in-memory cache for the session.
import { supabase } from '../supabaseClient';

let cache = null;
let inflight = null;

export function fetchCategories(force = false) {
  if (cache && !force) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = supabase
    .from('categories')
    .select('id, slug, name, sort_order, parent_id')
    .order('sort_order', { ascending: true })
    .then(({ data, error }) => {
      inflight = null;
      if (error) throw error;
      cache = data || [];
      return cache;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

const byId = (list, id) => (list || []).find((c) => String(c.id) === String(id));
export const getCategoryById = (list, id) => byId(list, id);
export const getCategoryBySlug = (list, slug) => {
  const s = String(slug || '').toLowerCase();
  return (list || []).find((c) => String(c.slug || '').toLowerCase() === s);
};

// Root "libraries" = categories without a parent.
export const getRootCategories = (list) => (list || []).filter((c) => !c.parent_id);

// Children of a given category id (its subcategories).
export const getSubcategories = (list, parentId) =>
  (list || []).filter((c) => parentId && String(c.parent_id) === String(parentId));

// Categories with their real prompt counts from the database.
// Uses the category_stats view when available, otherwise falls back to a
// client-side count over the prompts table.
export async function fetchCategoryStats() {
  const { data, error } = await supabase
    .from('category_stats')
    .select('id, slug, name, parent_id, sort_order, prompt_count');
  if (!error && data) return data;

  // Fallback: count prompts per category client-side.
  const cats = cache || (await fetchCategories(true));
  const { data: promptRows } = await supabase.from('prompts').select('category_id');
  const counts = {};
  (promptRows || []).forEach((p) => {
    if (p.category_id) counts[p.category_id] = (counts[p.category_id] || 0) + 1;
  });
  return cats.map((c) => ({ ...c, prompt_count: counts[c.id] || 0 }));
}