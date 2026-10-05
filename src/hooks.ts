import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from './store';
import { stories as storiesService } from './services/supabase';

/**
 * Hook pour gérer les likes/bookmarks avec feedback
 */
export const useStoryActions = (storyId: string) => {
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      try {
        const [liked, bookmarked] = await Promise.all([
          storiesService.isLiked(storyId, user.id),
          storiesService.isBookmarked(storyId, user.id),
        ]);
        setIsLiked(liked);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error('Failed to check story status:', error);
      }
    };

    checkStatus();
  }, [storyId, user]);

  const toggleLike = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      if (isLiked) {
        await storiesService.unlike(storyId, user.id);
        setIsLiked(false);
      } else {
        await storiesService.like(storyId, user.id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLoading(false);
    }
  }, [storyId, user, isLiked, loading]);

  const toggleBookmark = useCallback(async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      if (isBookmarked) {
        await storiesService.unbookmark(storyId, user.id);
        setIsBookmarked(false);
      } else {
        await storiesService.bookmark(storyId, user.id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setLoading(false);
    }
  }, [storyId, user, isBookmarked, loading]);

  return {
    isLiked,
    isBookmarked,
    toggleLike,
    toggleBookmark,
    loading,
  };
};

/**
 * Hook pour la pagination
 */
export const usePagination = (initialPage = 1, limit = 20) => {
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  const goToNext = useCallback(() => setPage(p => p + 1), []);
  const goToPrev = useCallback(() => setPage(p => Math.max(1, p - 1)), []);
  const reset = useCallback(() => setPage(1), []);

  return {
    page,
    setPage,
    hasMore,
    setHasMore,
    goToNext,
    goToPrev,
    reset,
    offset: (page - 1) * limit,
  };
};

/**
 * Hook pour gérer le debounce
 */
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook pour les erreurs avec auto-clear
 */
export const useError = (initialMessage = '', duration = 5000) => {
  const [error, setError] = useState(initialMessage);

  const showError = useCallback((message: string) => {
    setError(message);
    if (duration > 0) {
      setTimeout(() => setError(''), duration);
    }
  }, [duration]);

  const clearError = useCallback(() => setError(''), []);

  return {
    error,
    showError,
    clearError,
  };
};

/**
 * Hook pour vérifier la connexion
 */
export const useRequireAuth = () => {
  const { user } = useAuthStore();
  
  return {
    isAuthenticated: !!user,
    user,
  };
};
