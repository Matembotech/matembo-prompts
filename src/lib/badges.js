// Badge computations shared by PromptCard and PromptDetail.
import { NEW_BADGE_DAYS } from './config';

export function isNewPrompt(createdAt, now = Date.now()) {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  const ageDays = (now - created) / 86_400_000;
  return ageDays >= 0 && ageDays <= NEW_BADGE_DAYS;
}

// Trending is server-computed (see migrations/0007_trending.sql): a prompt is
// trending only while trending_until is in the future.
export function isTrendingPrompt(trendingUntil, now = Date.now()) {
  if (!trendingUntil) return false;
  const until = new Date(trendingUntil).getTime();
  if (Number.isNaN(until)) return false;
  return until > now;
}