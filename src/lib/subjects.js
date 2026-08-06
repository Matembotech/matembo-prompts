// Subject data access. Subjects come from the database (never hardcoded),
// with an in-memory cache for the session.
import { supabase } from '../supabaseClient';

let cache = null;
let inflight = null;

export function fetchSubjects(force = false) {
  if (cache && !force) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = supabase
    .from('subjects')
    .select('id, slug, name, sort_order')
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

export const getSubjectById = (list, id) => (list || []).find((s) => String(s.id) === String(id));
export const getSubjectBySlug = (list, slug) => {
  const s = String(slug || '').toLowerCase();
  return (list || []).find((c) => String(c.slug || '').toLowerCase() === s);
};