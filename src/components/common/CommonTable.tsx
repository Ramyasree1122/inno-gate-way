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

export type TableAction<T> = {
  label: React.ReactNode;
  onClick: (row: T) => void;
  className?: string;
};

interface CommonTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  rowKey?: keyof T | ((row: T, index: number) => React.Key);
  className?: string;
  actions?: TableAction<T>[];
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
  actions,
  headerClassName,
  bodyClassName,
}: CommonTableProps<T>) {
  const hasActions = Boolean(actions && actions.length > 0);

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
                      <DropdownMenuContent align="end" className="w-[120px] bg-white border border-neutral-200 shadow-lg rounded-md p-1">
                        {actions?.map((action, actionIdx) => (
                          <DropdownMenuItem
                            key={actionIdx}
                            onClick={() => action.onClick(row)}
                            className={cn(
                              "cursor-pointer px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors flex items-center gap-2",
                              action.className
                            )}
                          >
                            {action.label}
                          </DropdownMenuItem>
                        ))}
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