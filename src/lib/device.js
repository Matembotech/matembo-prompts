// Device-scoped interaction store (localStorage).
// Lets anonymous visitors like / bookmark without signing in. Interactions are
// kept per browser until the visitor signs in, at which point they are synced
// to Supabase (see syncDeviceInteractions) and the local copy is cleared.

const LIKES_KEY = 'mtp_likes';
const BOOKMARKS_KEY = 'mtp_bookmarks';

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(key, ids) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* storage full/unavailable: ignore */
  }
}

function makeStore(key) {
  return {
    has(id) {
      return id ? read(key).includes(id) : false;
    },
    set(id, on) {
      if (!id) return;
      const ids = read(key);
      const next = on
        ? (ids.includes(id) ? ids : [...ids, id])
        : ids.filter((x) => x !== id);
      write(key, next);
    },
    all() {
      return read(key);
    },
    clear() {
      write(key, []);
    },
  };
}

export const deviceLikes = makeStore(LIKES_KEY);
export const deviceBookmarks = makeStore(BOOKMARKS_KEY);

// Called once when a user signs in. Moves any device-local likes/bookmarks
// into the authenticated Supabase tables, then clears the device copy.
export async function syncDeviceInteractions(supabase, user) {
  if (!user?.id) return;

  const likes = deviceLikes.all();
  const bookmarks = deviceBookmarks.all();

  if (likes.length) {
    const { error: likeErr } = await supabase
      .from('likes')
      .upsert(
        likes.map((prompt_id) => ({ prompt_id, user_id: user.id })),
        { onConflict: 'prompt_id,user_id' }
      );
    if (!likeErr) deviceLikes.clear();
  }

  if (bookmarks.length) {
    const { error: bmErr } = await supabase
      .from('bookmarks')
      .upsert(
        bookmarks.map((prompt_id) => ({ prompt_id, user_id: user.id })),
        { onConflict: 'prompt_id,user_id' }
      );
    if (!bmErr) deviceBookmarks.clear();
  }
}