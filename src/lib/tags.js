// Tag data access. Tags are a flexible, admin-managed attribute dimension on
// prompts (STYLE / SUBJECT / TECHNIQUE etc.), separate from categories. They
// come entirely from the database — never hardcoded.
import { supabase } from '../supabaseClient';

let cache = null;
let inflight = null;

export function slugifyTag(name = '') {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Split a comma-separated tag input into trimmed, non-empty names.
export function parseTagNames(input = '') {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function fetchTags(force = false) {
  if (cache && !force) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = supabase
    .from('tags')
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

export const getTagBySlug = (list, slug) => {
  const s = String(slug || '').toLowerCase();
  return (list || []).find((t) => String(t.slug || '').toLowerCase() === s);
};

// All tags attached to a single prompt.
export async function getPromptTags(promptId) {
  const { data, error } = await supabase
    .from('prompt_tags')
    .select('tag:tags!inner ( id, slug, name )')
    .eq('prompt_id', promptId)
    .order('tag_id', { ascending: true });
  if (error) throw error;
  return (data || []).map((r) => r.tag).filter(Boolean);
}

// Replace a prompt's tag set with the given names (ensures each tag exists).
export async function savePromptTags(promptId, names = []) {
  const want = names.map((s) => s.trim()).filter(Boolean);

  // Reset current link set for the prompt.
  await supabase.from('prompt_tags').delete().eq('prompt_id', promptId);
  if (!want.length) return [];

  const existing = await fetchTags(true).catch(() => []);
  const linked = [];

  for (const name of want) {
    const slug = slugifyTag(name);
    let tag = existing.find(
      (t) => String(t.slug).toLowerCase() === slug || String(t.name).toLowerCase() === String(name).toLowerCase()
    );
    if (!tag) {
      const { data, error } = await supabase
        .from('tags')
        .insert({ name, slug })
        .select()
        .single();
      if (error || !data) continue;
      tag = data;
      existing.push(data);
    }
    linked.push(tag);
  }

  if (linked.length) {
    const { error } = await supabase
      .from('prompt_tags')
      .insert(linked.map((t) => ({ prompt_id: promptId, tag_id: t.id })));
    if (error) throw error;
  }
  return linked;
}