"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

import { cn } from "@/lib/utils";

import dayjs from "dayjs";

export type TableColumn<T> = {
  key: keyof T | string;
  title: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
};

interface CommonTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  rowKey?: keyof T | ((row: T, index: number) => React.Key);
  className?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onChangeWorkspace?: (row: T) => void;
  onExtendDuration?: (row: T) => void;
  onRegenerateKey?: (row: T) => void;
  onDisableKey?: (row: T) => void;
  headerClassName?: string;
  bodyClassName?: string;
}

export function formatDate(value: unknown): string {
  if (value === null || value === undefined) return "";
  const dateStr = String(value);
  // Match typical date formats: ISO format 2026-08-05T06:34:29Z or YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;
  if (dateRegex.test(dateStr)) {
    const d = dayjs(dateStr);
    if (d.isValid()) {
      return d.format("DD/MM/YYYY");
    }
  }
  return dateStr;
}

export function CommonTable<T>({
  columns,
  data = [],
  emptyMessage = "No records found.",
  rowKey,
  className,
  onEdit,
  onDelete,
  onChangeWorkspace,
  onExtendDuration,
  onRegenerateKey,
  onDisableKey,
  headerClassName,
  bodyClassName,
}: CommonTableProps<T>) {
  const hasActions = Boolean(
    onEdit ||
      onDelete ||
      onChangeWorkspace ||
      onExtendDuration ||
      onRegenerateKey ||
      onDisableKey
  );

  return (
    <div className={`rounded-lg border bg-white w-full overflow-x-auto ${className ?? ""}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key.toString()}
                className={cn(headerClassName, column.className)}
              >
                {column.title}
              </TableHead>
            ))}
            {hasActions && <TableHead className="w-[50px]" />}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length ? (
            data.map((row, index) => (
              <TableRow
                key={
                  typeof rowKey === "function"
                    ? rowKey(row, index)
                    : rowKey
                    ? String(row[rowKey])
                    : index
                }
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key.toString()}
                    className={cn(bodyClassName, column.className)}
                  >
                    {column.render
                      ? column.render(row)
                      : formatDate(row[column.key as keyof T] ?? "")}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell className="w-[50px] text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-neutral-100 transition-colors cursor-pointer outline-none border-none">
                        <MoreVertical className="h-4 w-4 text-neutral-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px] bg-white border border-neutral-200 shadow-lg rounded-md p-1 z-50">
                        {onChangeWorkspace && (
                          <DropdownMenuItem
                            onClick={() => onChangeWorkspace(row)}
                            className="cursor-pointer px-3 py-2 text-sm text-neutral-900 hover:!bg-neutral-100 data-[focus]:!bg-neutral-100 rounded-md transition-colors flex items-center gap-2"
                          >
                            Change Workspace
                          </DropdownMenuItem>
                        )}
                        {onExtendDuration && (
                          <DropdownMenuItem
                            onClick={() => onExtendDuration(row)}
                            className="cursor-pointer px-3 py-2 text-sm text-neutral-900 hover:!bg-neutral-100 data-[focus]:!bg-neutral-100 rounded-md transition-colors flex items-center gap-2"
                          >
                            Extend Duration
                          </DropdownMenuItem>
                        )}
                        {onRegenerateKey && (
                          <DropdownMenuItem
                            onClick={() => onRegenerateKey(row)}
                            className="cursor-pointer px-3 py-2 text-sm text-neutral-900 hover:!bg-neutral-100 data-[focus]:!bg-neutral-100 rounded-md transition-colors flex items-center gap-2"
                          >
                            Regenerate Key
                          </DropdownMenuItem>
                        )}
                        {onDisableKey && (
                          <DropdownMenuItem
                            onClick={() => onDisableKey(row)}
                            className="cursor-pointer px-3 py-2 text-sm text-neutral-900 hover:!bg-neutral-100 data-[focus]:!bg-neutral-100 rounded-md transition-colors flex items-center gap-2"
                          >
                            {(row as { is_active?: boolean }).is_active ? "Disable Key" : "Enable Key"}
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(row)}
                            className="cursor-pointer px-3 py-2 text-sm text-neutral-900 hover:!bg-neutral-100 data-[focus]:!bg-neutral-100 rounded-md transition-colors flex items-center gap-2"
                          >
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(row)}
                            className="cursor-pointer px-3 py-2 text-sm text-red-600 hover:!bg-red-50 data-[focus]:!bg-red-55 rounded-md transition-colors flex items-center gap-2"
                          >
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}