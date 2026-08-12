"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  showCloseIcon?: boolean;
  closeOnBackdropClick?: boolean;
}

export function CommonModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseIcon = true,
  closeOnBackdropClick = false,
}: CommonModalProps) {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-50 w-full max-w-md transform rounded-xl bg-white p-4 shadow-2xl transition-all duration-300 ease-out border border-neutral-100",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          {showCloseIcon && (
            <button
              onClick={onClose}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer border-none outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="text-sm text-neutral-600">{children}</div>
      </div>
    </div>
  );
}
