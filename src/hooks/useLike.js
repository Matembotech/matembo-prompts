import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { deviceLikes } from '../lib/device';

// Like toggle that works WITHOUT signing in:
//  - authenticated: backed by the likes table + trigger-maintained count
//  - anonymous:    backed by device-local storage (synced to DB on sign-in)
export function useLike({ promptId, initialCount = 0 } = {}) {
  const { user, syncTick } = useAuth();
  const [dbLiked, setDbLiked] = useState(false);
  const [localLiked, setLocalLiked] = useState(() => (!user ? deviceLikes.has(promptId) : false));
  const [count, setCount] = useState(initialCount);
  const [ready, setReady] = useState(false);

  const liked = user ? dbLiked : localLiked;

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    if (!promptId) return;

    if (user) {
      let active = true;
      supabase
        .from('likes')
        .select('id')
        .eq('prompt_id', promptId)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (active) {
            setDbLiked(Boolean(data));
            setReady(true);
          }
        })
        .catch(() => {
          if (active) setReady(true);
        });
      return () => {
        active = false;
      };
    }

    setDbLiked(false);
    setLocalLiked(deviceLikes.has(promptId));
    setReady(true);
  }, [promptId, user?.id, syncTick]);

  // Effective count: the DB count, plus 1 for an anonymous like that isn't
  // reflected server-side yet. (Authenticated likes are already in the count.)
  const effectiveCount = count + (user ? 0 : liked ? 1 : 0);

  const toggle = useCallback(async () => {
    if (!promptId) return null;
    const next = !liked;

    if (user) {
      setDbLiked(next);
      setCount((c) => Math.max(0, c + (next ? 1 : -1)));
      if (next) {
        const { error } = await supabase.from('likes').upsert(
          { prompt_id: promptId, user_id: user.id },
          { onConflict: 'prompt_id,user_id' }
        );
        if (error) {
          setDbLiked(false);
          setCount((c) => Math.max(0, c - 1));
          return { error };
        }
      } else {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('prompt_id', promptId)
          .eq('user_id', user.id);
        if (error) {
          setDbLiked(true);
          setCount((c) => c + 1);
          return { error };
        }
      }
    } else {
      deviceLikes.set(promptId, next);
      setLocalLiked(next);
    }
    return null;
  }, [user, promptId, liked]);

  return { liked, count: effectiveCount, toggle, ready };
}