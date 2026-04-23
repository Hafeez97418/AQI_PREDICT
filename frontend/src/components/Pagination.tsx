import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const isPrevDisabled = page <= 1;
  const isNextDisabled = page >= totalPages;

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => !isPrevDisabled && onPageChange(page - 1)}
        disabled={isPrevDisabled}
        className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-150 hover:border-teal-500/50 hover:text-teal-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:text-slate-300"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Previous
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "…")[]>((acc, p, idx, arr) => {
            if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) {
              acc.push("…");
            }
            acc.push(p);
            return acc;
          }, [])
          .map((item, idx) =>
            item === "…" ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-slate-500">…</span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item as number)}
                className={`h-8 w-8 rounded-md text-sm font-medium transition-all duration-150 ${page === item
                    ? "bg-teal-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
              >
                {item}
              </button>
            )
          )}
      </div>

      <button
        onClick={() => !isNextDisabled && onPageChange(page + 1)}
        disabled={isNextDisabled}
        className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-all duration-150 hover:border-teal-500/50 hover:text-teal-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-700 disabled:hover:text-slate-300"
      >
        Next
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
