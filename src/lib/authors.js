// Author name resolution. Falls back to a sensible default when a prompt has
// no author or the author was deleted (author_id set null on cascade).
import { DEFAULT_AUTHOR } from './config';

export function resolveAuthorName(profile, fallback = DEFAULT_AUTHOR) {
  return profile?.full_name || fallback;
}

export function authorInitial(fullName) {
  if (!fullName) return 'M';
  return fullName.trim().charAt(0).toUpperCase();
}