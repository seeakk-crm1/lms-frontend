import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReportPaginationProps {
  page: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
}

const ReportPagination: React.FC<ReportPaginationProps> = ({ page, totalPages = 1, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-2 border-t border-gray-200/80 print:hidden">
      <p className="text-xs font-semibold text-gray-500">
        Page <span className="font-bold text-gray-800">{page}</span> of <span className="font-bold text-gray-800">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
        >
          <ChevronLeft size={13} />
          <span>Previous</span>
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default ReportPagination;
