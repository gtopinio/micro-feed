// 🔄 Paginated Posts Hook
// Following Sina's recommended structure for pagination

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types/post';
import { getPostsPaginatedWithFilter } from '@/lib/db';
import {
  PaginationResult,
  createPaginationParams,
  UsePaginationOptions,
  createPaginationActions,
} from '@/lib/pagination';

interface UsePostsPaginatedReturn {
  // Data
  posts: Post[];
  loading: boolean;
  error: string | null;

  // Pagination info
  pagination: PaginationResult<Post>['pagination'] | null;

  // Pagination controls
  currentPage: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;

  // Actions
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePostsPaginated(
  options: UsePaginationOptions = {},
  filter: 'all' | 'my' = 'all',
  searchQuery?: string
): UsePostsPaginatedReturn {
  const { initialPage = 1, initialLimit = 10, onPageChange } = options;

  // State for posts and pagination
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationInfo, setPaginationInfo] = useState<
    PaginationResult<Post>['pagination'] | null
  >(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  // Fetch posts function
  const fetchPosts = useCallback(
    async (page: number, pageLimit: number) => {
      try {
        setLoading(true);
        setError(null);

        const params = createPaginationParams(page, pageLimit);
        const result = await getPostsPaginatedWithFilter(
          params,
          filter,
          searchQuery
        );

        setPosts(result.data);
        setPaginationInfo(result.pagination);
      } catch (err) {
        console.error('Error fetching paginated posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        setPosts([]);
        setPaginationInfo(null);
      } finally {
        setLoading(false);
      }
    },
    [filter, searchQuery]
  );

  // Refetch current page
  const refetch = useCallback(() => {
    return fetchPosts(currentPage, limit);
  }, [fetchPosts, currentPage, limit]);

  // Alias for refetch
  const refresh = refetch;

  // Handle page changes
  const handlePageChange = useCallback(
    (newPage: number) => {
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    },
    [onPageChange]
  );

  // Handle limit changes
  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    // Reset to first page when limit changes
    setCurrentPage(1);
  }, []);

  // Create pagination actions
  const paginationActions = createPaginationActions(
    currentPage,
    limit,
    handlePageChange,
    handleLimitChange,
    onPageChange
  );

  // Fetch posts when page or limit changes
  useEffect(() => {
    fetchPosts(currentPage, limit);
  }, [fetchPosts, currentPage, limit]);

  return {
    // Data
    posts,
    loading,
    error,
    pagination: paginationInfo,

    // Pagination controls
    currentPage: paginationActions.currentPage,
    limit: paginationActions.limit,
    setPage: paginationActions.setPage,
    setLimit: paginationActions.setLimit,
    nextPage: paginationActions.nextPage,
    previousPage: paginationActions.previousPage,
    goToFirstPage: paginationActions.goToFirstPage,
    goToLastPage: () =>
      paginationActions.goToLastPage(paginationInfo?.totalPages || 1),

    // Actions
    refetch,
    refresh,
  };
}
