import { useEffect, useState, useCallback } from 'react';
import { fetchPrompts } from '../lib/prompts';
import { fetchCategories } from '../lib/categories';
import { fetchSubjects } from '../lib/subjects';

// Grid data hook: categories, subjects, prompts, pagination, filters.
export function usePrompts({ categorySlug = null, subjectSlug = null, pageSize } = {}) {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [activeCategorySlug, setActiveCategorySlug] = useState(categorySlug || null);
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [activeSubjectSlug, setActiveSubjectSlug] = useState(subjectSlug || null);

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

  useEffect(() => {
    let active = true;
    fetchSubjects()
      .then((list) => {
        if (!active) return;
        setSubjects(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Resolve slug -> id once lists are known or slugs change.
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
    if (!activeSubjectSlug) {
      setActiveSubjectId(null);
      return;
    }
    if (subjects.length === 0) return;
    const slug = String(activeSubjectSlug).toLowerCase();
    const match = subjects.find((s) => String(s.slug || '').toLowerCase() === slug);
    setActiveSubjectId(match ? match.id : null);
  }, [activeSubjectSlug, subjects]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchPrompts({ page, categoryId: activeCategoryId, subjectId: activeSubjectId, pageSize })
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
  }, [page, activeCategoryId, activeSubjectId, pageSize]);

  const selectCategory = useCallback((slug) => {
    setPage(1);
    setActiveCategorySlug(slug ? String(slug).toLowerCase() : null);
  }, []);

  const selectSubject = useCallback((slug) => {
    setPage(1);
    setActiveSubjectSlug(slug ? String(slug).toLowerCase() : null);
  }, []);

  const goToPage = useCallback((next) => {
    setPage(next);
  }, []);

  const totalPages = Math.ceil(totalCount / (pageSize || 10));

  return {
    prompts,
    categories,
    subjects,
    loading,
    error,
    page,
    totalCount,
    totalPages,
    activeCategorySlug,
    activeSubjectSlug,
    selectCategory,
    selectSubject,
    goToPage,
  };
}