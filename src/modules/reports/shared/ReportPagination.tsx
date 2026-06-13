import React from 'react';

interface ReportPaginationProps {
  page: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
}

const ReportPagination: React.FC<ReportPaginationProps> = ({ page, totalPages = 1, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between print:hidden">
      <p className="text-xs font-semibold text-gray-500">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ReportPagination;
