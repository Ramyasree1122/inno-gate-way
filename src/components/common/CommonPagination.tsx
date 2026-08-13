"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommonPaginationProps {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  itemName?: string;
  pageSizeOptions?: number[];
}

export function CommonPagination({
  pageNumber,
  pageSize,
  totalRecords,
  totalPages,
  onPageChange,
  onPageSizeChange,
  itemName = "records",
  pageSizeOptions = [10, 20, 50, 100],
}: CommonPaginationProps) {
  const startRecord = totalRecords === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const endRecord = Math.min(pageNumber * pageSize, totalRecords);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (pageNumber > 3) {
        pages.push("...");
      }

      const start = Math.max(2, pageNumber - 1);
      const end = Math.min(totalPages - 1, pageNumber + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (pageNumber < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between w-full  bg-white mt-2 text-neutral-500 text-xs font-normal select-none">
      {/* Left side: Range Info */}
      <div className="font-medium text-sm text-black">
        Showing {startRecord}-{endRecord} of total {itemName}
      </div>

      {/* Right side: Controls */}
      <div className="flex items-center gap-4">
        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-black">Show upto</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs shadow-xs font-medium text-neutral-800 outline-none cursor-pointer"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Separator */}
        {onPageSizeChange && (
          <div className="h-4 w-[1px] bg-neutral-200" />
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            type="button"
            disabled={pageNumber === 1}
            onClick={() => onPageChange(pageNumber - 1)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none",
              pageNumber === 1
                ? "text-neutral-300 cursor-not-allowed"
                : "text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            )}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-neutral-400"
                >
                  ...
                </span>
              );
            }

            const isCurrent = page === pageNumber;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => {
                  if (!isCurrent) {
                    onPageChange(Number(page));
                  }
                }}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all focus:outline-none",
                  isCurrent
                    ? "bg-white border border-neutral-200 text-neutral-900 shadow-xs font-semibold"
                    : "text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                )}
              >
                {page}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            disabled={pageNumber === totalPages || totalPages === 0}
            onClick={() => onPageChange(pageNumber + 1)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none",
              pageNumber === totalPages || totalPages === 0
                ? "text-neutral-300 cursor-not-allowed"
                : "text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            )}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}