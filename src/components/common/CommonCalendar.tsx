"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

export interface CommonCalendarProps {
  value?: string | Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  inputClassName?: string;
  popupClassName?: string;
}

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function normalizeDate(value?: string | Date) {
  if (!value) return null;
  return dayjs(value).isValid() ? dayjs(value).startOf("day") : null;
}

export function CommonCalendar({
  value,
  onChange,
  placeholder = "Select date",
  label,
  minDate,
  maxDate,
  className,
  inputClassName,
  popupClassName,
}: CommonCalendarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<dayjs.Dayjs | null>(normalizeDate(value));
  const [currentMonth, setCurrentMonth] = React.useState<dayjs.Dayjs>(selectedDate ?? dayjs().startOf("month"));
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const parsed = normalizeDate(value);
    setSelectedDate(parsed);
    if (parsed) {
      setCurrentMonth(parsed.startOf("month"));
    }
  }, [value]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = selectedDate
    ? selectedDate.format("MMM D, YYYY")
    : "";

  const daysInMonth = currentMonth.daysInMonth();
  const startOfMonth = currentMonth.startOf("month");
  const beginningDay = startOfMonth.day();

  const monthDays = React.useMemo(() => {
    const days: Array<{ date: dayjs.Dayjs; disabled: boolean }> = [];
    for (let idx = 0; idx < beginningDay; idx += 1) {
      days.push({ date: startOfMonth.subtract(beginningDay - idx, "day"), disabled: true });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = startOfMonth.date(day);
      const disabled = Boolean(
        (minDate && date.isBefore(dayjs(minDate).startOf("day"))) ||
        (maxDate && date.isAfter(dayjs(maxDate).startOf("day")))
      );
      days.push({ date, disabled });
    }
    const trailing = (7 - (days.length % 7)) % 7;
    for (let idx = 0; idx < trailing; idx += 1) {
      days.push({ date: currentMonth.endOf("month").add(idx + 1, "day"), disabled: true });
    }
    return days;
  }, [beginningDay, currentMonth, daysInMonth, minDate, maxDate, startOfMonth]);

  const handleDaySelect = (date: dayjs.Dayjs) => {
    if (
      (minDate && date.isBefore(dayjs(minDate).startOf("day"))) ||
      (maxDate && date.isAfter(dayjs(maxDate).startOf("day")))
    ) {
      return;
    }
    setSelectedDate(date);
    onChange?.(date.toDate());
    setIsOpen(false);
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "group flex w-full items-center justify-between gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 transition hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-300",
          inputClassName,
        )}
      >
        <span className={cn("truncate text-left text-sm", selectedLabel ? "text-neutral-900" : "text-neutral-500")}> 
          {selectedLabel || placeholder}
        </span>
        <CalendarDays className="h-4 w-4 text-neutral-400" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-3 min-w-[320px] rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_22px_80px_rgba(15,23,42,0.12)]",
            popupClassName,
          )}
        >
          <div className="flex items-center justify-between gap-4 pb-4">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Select Date</p>
              <p className="text-xs text-neutral-500">Choose a start or end date</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1">
              <button
                type="button"
                onClick={() => setCurrentMonth((month) => month.subtract(1, "month"))}
                aria-label="Previous month"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-white hover:text-neutral-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth((month) => month.add(1, "month"))}
                aria-label="Next month"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-white hover:text-neutral-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            {WEEK_DAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2 text-center">
            {monthDays.map(({ date, disabled }) => {
              const isSelected = !!selectedDate && date.isSame(selectedDate, "day");
              const isCurrentMonth = date.month() === currentMonth.month();
              return (
                <button
                  key={date.toString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDaySelect(date)}
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition",
                    disabled && "cursor-not-allowed opacity-40",
                    isSelected && "bg-purple-600 text-white shadow-sm",
                    !isSelected && !disabled && isCurrentMonth && "text-neutral-900 hover:bg-neutral-100",
                    !isSelected && !disabled && !isCurrentMonth && "text-neutral-400",
                  )}
                >
                  {date.date()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
