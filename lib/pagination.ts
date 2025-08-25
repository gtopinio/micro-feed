// 🔄 Pagination utilities for micro feed
// Following Sina's recommended structure

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
  };
}

export interface PaginationConfig {
  defaultLimit: number;
  maxLimit: number;
}

// Default pagination configuration
export const DEFAULT_PAGINATION: PaginationConfig = {
  defaultLimit: 10,
  maxLimit: 50,
};

// Create pagination parameters from page and limit
export function createPaginationParams(
  page: number = 1,
  limit: number = DEFAULT_PAGINATION.defaultLimit
): PaginationParams {
  // Validate and sanitize inputs
  const validPage = Math.max(1, Math.floor(page));
  const validLimit = Math.min(
    Math.max(1, Math.floor(limit)),
    DEFAULT_PAGINATION.maxLimit
  );

  const offset = (validPage - 1) * validLimit;

  return {
    page: validPage,
    limit: validLimit,
    offset,
  };
}

// Create pagination result from data and total count
export function createPaginationResult<T>(
  data: T[],
  totalItems: number,
  params: PaginationParams
): PaginationResult<T> {
  const totalPages = Math.ceil(totalItems / params.limit);
  const hasNextPage = params.page < totalPages;
  const hasPreviousPage = params.page > 1;

  return {
    data,
    pagination: {
      currentPage: params.page,
      totalPages,
      totalItems,
      hasNextPage,
      hasPreviousPage,
      limit: params.limit,
    },
  };
}

// Utility to get page numbers for pagination UI
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible - 1);

  // Adjust start if we're near the end
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// URL parameter utilities for pagination
export function getPaginationFromSearchParams(
  searchParams: URLSearchParams
): PaginationParams {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(
    searchParams.get('limit') || DEFAULT_PAGINATION.defaultLimit.toString(),
    10
  );

  return createPaginationParams(page, limit);
}

export function createPaginationSearchParams(
  params: PaginationParams
): URLSearchParams {
  const searchParams = new URLSearchParams();
  searchParams.set('page', params.page.toString());
  searchParams.set('limit', params.limit.toString());

  return searchParams;
}

// React hook utilities for pagination state
export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  onPageChange?: (page: number) => void;
}

export interface UsePaginationReturn {
  currentPage: number;
  limit: number;
  offset: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: (totalPages: number) => void;
  params: PaginationParams;
}

// Helper function for pagination logic (can be used in custom hooks)
export function createPaginationActions(
  currentPage: number,
  limit: number,
  setPage: (page: number) => void,
  setLimit: (limit: number) => void,
  onPageChange?: (page: number) => void
): UsePaginationReturn {
  const params = createPaginationParams(currentPage, limit);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage);
  };

  return {
    currentPage: params.page,
    limit: params.limit,
    offset: params.offset,
    setPage: handlePageChange,
    setLimit,
    nextPage: () => handlePageChange(params.page + 1),
    previousPage: () => handlePageChange(Math.max(1, params.page - 1)),
    goToFirstPage: () => handlePageChange(1),
    goToLastPage: (totalPages: number) => handlePageChange(totalPages),
    params,
  };
}
