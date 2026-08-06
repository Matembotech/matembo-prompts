// Prompt data access. Centralizes queries, joins (category/author), and the
// counter RPCs so components stay thin and self-consistent.
import { supabase } from '../supabaseClient';
import { PROMPTS_PER_PAGE } from './config';

const PROMPT_LIST_COLUMNS = `
  id, slug, title, excerpt, image_url, image_prompt, video_prompt,
  category_id, author_id, subject_id,
  like_count, save_count, share_count, view_count, trending_until, created_at,
  categories ( id, slug, name, parent_id, parent: parent_id ( id, slug, name ) ),
  profiles ( id, full_name, avatar_url ),
  subjects ( id, slug, name )
`;

// Normalize a raw joined row into the shape components consume.
export function normalizePrompt(raw = {}) {
  const category = Array.isArray(raw.categories) ? raw.categories[0] : raw.categories;
  const author = Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles;
  const subject = Array.isArray(raw.subjects) ? raw.subjects[0] : raw.subjects;
  return {
    ...raw,
    category: category || null,
    author: author || null,
    subject: subject || null,
    category_id: raw.category_id,
    author_id: raw.author_id,
    subject_id: raw.subject_id,
  };
}

// Paginated list, optionally filtered by category and/or subject.
export async function fetchPrompts({ page = 1, categoryId = null, subjectId = null, pageSize = PROMPTS_PER_PAGE } = {}) {
  let query = supabase
    .from('prompts')
    .select(PROMPT_LIST_COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (categoryId) query = query.eq('category_id', categoryId);
  if (subjectId) query = query.eq('subject_id', subjectId);

  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return {
    prompts: (data || []).map(normalizePrompt),
    totalCount: count ?? 0,
  };
}

// Single prompt by slug or uuid.
export async function fetchPromptByIdentifier(identifier) {
  let query = supabase
    .from('prompts')
    .select(`${PROMPT_LIST_COLUMNS}, description, image_prompt, video_prompt`);

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier || '');
  query = isUuid ? query.eq('id', identifier) : query.eq('slug', identifier);

  const { data, error } = await query.single();
  if (error) throw error;
  return normalizePrompt(data);
}

// A few prompts for the "You may also like" strip (full card data).
export async function fetchRecommendations(excludeId, limit = 3) {
  const { data, error } = await supabase
    .from('prompts')
    .select(PROMPT_LIST_COLUMNS)
    .neq('id', excludeId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []).sort(() => 0.5 - Math.random()).slice(0, limit).map(normalizePrompt);
}

// ── Counter increments (safe RPC; work for anon + authenticated) ──
export const incrementView = (id) => incrementCounter(id, 'view_count');
export const incrementCopy = (id) => incrementCounter(id, 'copy_count');
export const incrementShare = (id) =>
  supabase.rpc('increment_share_count', { p_prompt_id: id }).then(({ error }) => {
    if (error) console.error('Failed to increment share_count:', error.message);
  });

function incrementCounter(id, column) {
  return supabase
    .rpc('increment_counter', { p_table: 'prompts', p_column: column, p_id: id, p_amount: 1 })
    .then(({ error }) => {
      if (error) console.error(`Failed to increment ${column}:`, error.message);
    });
}