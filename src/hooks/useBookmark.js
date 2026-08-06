import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { deviceBookmarks } from '../lib/device';

// Bookmark/save toggle that works WITHOUT signing in, same pattern as useLike.
export function useBookmark({ promptId, initialCount = 0 } = {}) {
  const { user, syncTick } = useAuth();
  const [dbSaved, setDbSaved] = useState(false);
  const [localSaved, setLocalSaved] = useState(() => (!user ? deviceBookmarks.has(promptId) : false));
  const [count, setCount] = useState(initialCount);
  const [ready, setReady] = useState(false);

  const saved = user ? dbSaved : localSaved;

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    if (!promptId) return;

    if (user) {
      let active = true;
      supabase
        .from('bookmarks')
        .select('id')
        .eq('prompt_id', promptId)
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (active) {
            setDbSaved(Boolean(data));
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

    setDbSaved(false);
    setLocalSaved(deviceBookmarks.has(promptId));
    setReady(true);
  }, [promptId, user?.id, syncTick]);

  const effectiveCount = count + (user ? 0 : saved ? 1 : 0);

  const toggle = useCallback(async () => {
    if (!promptId) return null;
    const next = !saved;

    if (user) {
      setDbSaved(next);
      setCount((c) => Math.max(0, c + (next ? 1 : -1)));
      if (next) {
        const { error } = await supabase.from('bookmarks').upsert(
          { prompt_id: promptId, user_id: user.id },
          { onConflict: 'prompt_id,user_id' }
        );
        if (error) {
          setDbSaved(false);
          setCount((c) => Math.max(0, c - 1));
          return { error };
        }
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('prompt_id', promptId)
          .eq('user_id', user.id);
        if (error) {
          setDbSaved(true);
          setCount((c) => c + 1);
          return { error };
        }
      }
    } else {
      deviceBookmarks.set(promptId, next);
      setLocalSaved(next);
    }
    return null;
  }, [user, promptId, saved]);

  return { saved, count: effectiveCount, toggle, ready };
}