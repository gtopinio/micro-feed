// 🔄 Pagination Component
// Following Sina's recommended modular structure

'use client';

import { getPaginationRange } from '@/lib/pagination';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisible?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  showFirstLast = true,
  showPrevNext = true,
  maxVisible = 5,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPaginationRange(currentPage, totalPages, maxVisible);
  const hasFirst = showFirstLast && currentPage > 1;
  const hasLast = showFirstLast && currentPage < totalPages;
  const hasPrev = showPrevNext && currentPage > 1;
  const hasNext = showPrevNext && currentPage < totalPages;

  const buttonBaseClass = `
    px-3 py-2 text-sm font-medium rounded-lg transition-colors 
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900
  `;

  const buttonInactiveClass = `
    ${buttonBaseClass}
    text-slate-400 bg-slate-800 border border-slate-600 
    hover:bg-slate-700 hover:text-white hover:border-slate-500
  `;

  const buttonActiveClass = `
    ${buttonBaseClass}
    text-white bg-cyan-500 border border-cyan-500
    hover:bg-cyan-600 hover:border-cyan-600
  `;

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* First page button */}
      {hasFirst && (
        <button
          onClick={() => handlePageClick(1)}
          disabled={loading}
          className={buttonInactiveClass}
          title="First page"
        >
          <i className="fas fa-angle-double-left"></i>
        </button>
      )}

      {/* Previous page button */}
      {hasPrev && (
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={loading}
          className={buttonInactiveClass}
          title="Previous page"
        >
          <i className="fas fa-angle-left"></i>
        </button>
      )}

      {/* Page number buttons */}
      {pageNumbers.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => handlePageClick(pageNum)}
          disabled={loading}
          className={
            pageNum === currentPage ? buttonActiveClass : buttonInactiveClass
          }
          title={`Page ${pageNum}`}
        >
          {loading && pageNum === currentPage ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            pageNum
          )}
        </button>
      ))}

      {/* Next page button */}
      {hasNext && (
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={loading}
          className={buttonInactiveClass}
          title="Next page"
        >
          <i className="fas fa-angle-right"></i>
        </button>
      )}

      {/* Last page button */}
      {hasLast && (
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={loading}
          className={buttonInactiveClass}
          title="Last page"
        >
          <i className="fas fa-angle-double-right"></i>
        </button>
      )}
    </div>
  );
}

// Optional: Pagination info component
interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  limit,
  className = '',
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className={`text-sm text-slate-400 ${className}`}>
      <span>
        Showing <span className="font-medium text-slate-300">{startItem}</span>{' '}
        to <span className="font-medium text-slate-300">{endItem}</span> of{' '}
        <span className="font-medium text-slate-300">{totalItems}</span> posts
      </span>
      <span className="mx-2">•</span>
      <span>
        Page <span className="font-medium text-slate-300">{currentPage}</span>{' '}
        of <span className="font-medium text-slate-300">{totalPages}</span>
      </span>
    </div>
  );
}
