import { useEffect, useState, useCallback } from 'react';
import { fetchPrompts } from '../lib/prompts';
import { fetchCategories } from '../lib/categories';

// Grid data hook: categories, prompts, pagination, filters.
export function usePrompts({ categorySlug = null, pageSize } = {}) {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeCategorySlug, setActiveCategorySlug] = useState(categorySlug || null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((list) => {
        if (!active) return;
        setCategories(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Resolve slug -> id once the list is known or the slug changes.
  useEffect(() => {
    if (!activeCategorySlug) {
      setActiveCategoryId(null);
      return;
    }
    if (categories.length === 0) return;
    const slug = String(activeCategorySlug).toLowerCase();
    const match = categories.find((c) => String(c.slug || '').toLowerCase() === slug);
    setActiveCategoryId(match ? match.id : null);
  }, [activeCategorySlug, categories]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchPrompts({ page, categoryId: activeCategoryId, pageSize })
      .then((res) => {
        if (!active) return;
        setPrompts(res.prompts);
        setTotalCount(res.totalCount);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load prompts');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, activeCategoryId, pageSize]);

  const selectCategory = useCallback((slug) => {
    setPage(1);
    setActiveCategorySlug(slug ? String(slug).toLowerCase() : null);
  }, []);

  const goToPage = useCallback((next) => {
    setPage(next);
  }, []);

  const totalPages = Math.ceil(totalCount / (pageSize || 10));

  return {
    prompts,
    categories,
    loading,
    error,
    page,
    totalCount,
    totalPages,
    activeCategorySlug,
    selectCategory,
    goToPage,
  };
}