"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

export interface CommonCalendarProps {
  range?: boolean;
  value?: string | Date | [string | Date | null, string | Date | null] | null;
  onChange?: (val: any) => void;
  placeholder?: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  inputClassName?: string;
  popupClassName?: string;
  inline?: boolean;
  showActionButtons?: boolean;
  onApply?: (val: any) => void;
  onCancel?: () => void;
  showTime?: boolean;
  calendarTitle?: string;
}

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function normalizeDate(value?: any, keepTime?: boolean) {
  if (!value) return null;
  const val = Array.isArray(value) ? value[0] : value;
  if (!val) return null;
  return dayjs(val).isValid() ? (keepTime ? dayjs(val) : dayjs(val).startOf("day")) : null;
}

function normalizeRange(value?: any): [dayjs.Dayjs | null, dayjs.Dayjs | null] {
  if (!Array.isArray(value)) return [null, null];
  const start =
    value[0] && dayjs(value[0]).isValid()
      ? dayjs(value[0]).startOf("day")
      : null;
  const end =
    value[1] && dayjs(value[1]).isValid()
      ? dayjs(value[1]).startOf("day")
      : null;
  return [start, end];
}

export const formatDateRangeDisplay = (
  start: dayjs.Dayjs | null,
  end: dayjs.Dayjs | null,
  format = "MMM D, YYYY",
) => {
  if (start && end) {
    if (start.isSame(end, "day")) return start.format(format);
    return `${start.format(format)} - ${end.format(format)}`;
  }
  if (start) return `${start.format(format)} -`;
  return "";
};

export function CommonCalendar({
  range,
  value,
  onChange,
  placeholder = "Select date",
  label,
  showTime = false,
  calendarTitle,
  minDate,
  maxDate,
  className,
  inputClassName,
  popupClassName,
  inline,
  showActionButtons,
  onApply,
  onCancel,
}: CommonCalendarProps) {
  const [isOpen, setIsOpen] = React.useState(inline || false);
  const [selectedDate, setSelectedDate] = React.useState<dayjs.Dayjs | null>(
    normalizeDate(value, showTime),
  );
  const [selectedRange, setSelectedRange] = React.useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >(normalizeRange(value));
  const [hoverDate, setHoverDate] = React.useState<dayjs.Dayjs | null>(null);
  const initialDateRef = React.useRef<dayjs.Dayjs | null>(normalizeDate(value, showTime));
  const initialRangeRef = React.useRef<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >(normalizeRange(value));

  const initialMonth = range
    ? (selectedRange[0] ?? dayjs().startOf("month"))
    : (selectedDate ?? dayjs().startOf("month"));
  const [currentMonth, setCurrentMonth] =
    React.useState<dayjs.Dayjs>(initialMonth);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [hour, setHour] = React.useState("00");
  const [minute, setMinute] = React.useState("00");
  const [ampm, setAmpm] = React.useState<"AM" | "PM">("AM");

  const getSelectedDateTime = (date: dayjs.Dayjs | null) => {
    if (!date) return null;
    if (!showTime) return date;

    let h = parseInt(hour || "0", 10);
    const m = parseInt(minute || "0", 10);

    if (ampm === "PM" && h < 12) {
      h += 12;
    } else if (ampm === "AM" && h === 12) {
      h = 0;
    }

    return date.hour(h).minute(m).second(0).millisecond(0);
  };

  React.useEffect(() => {
    if (range) {
      const parsed = normalizeRange(value);
      setSelectedRange(parsed);
      initialRangeRef.current = parsed;
      if (parsed[0]) setCurrentMonth(parsed[0].startOf("month"));
    } else {
      const parsed = normalizeDate(value, showTime);
      setSelectedDate(parsed);
      initialDateRef.current = parsed;
      if (parsed) {
        setCurrentMonth(parsed.startOf("month"));
        if (showTime) {
          let h = parsed.hour();
          const m = parsed.minute();
          const period = h >= 12 ? "PM" : "AM";
          if (h > 12) h -= 12;
          if (h === 0) h = 12;
          setHour(String(h).padStart(2, "0"));
          setMinute(String(m).padStart(2, "0"));
          setAmpm(period);
        }
      }
    }
  }, [value, range, showTime]);

  React.useEffect(() => {
    if (inline) return;
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
  }, [inline]);

  const selectedLabel = range
    ? formatDateRangeDisplay(selectedRange[0], selectedRange[1])
    : selectedDate
      ? selectedDate.format(showTime ? "MMM D, YYYY h:mm A" : "MMM D, YYYY")
      : "";

  const hasSelectedValue = range
    ? !!(selectedRange[0] || selectedRange[1])
    : !!selectedDate;

  const isChanged = () => {
    if (range) {
      const initialStart = initialRangeRef.current[0];
      const initialEnd = initialRangeRef.current[1];
      const currentStart = selectedRange[0];
      const currentEnd = selectedRange[1];

      const startSame =
        (!initialStart && !currentStart) ||
        (!!initialStart &&
          !!currentStart &&
          initialStart.isSame(currentStart, "day"));
      const endSame =
        (!initialEnd && !currentEnd) ||
        (!!initialEnd && !!currentEnd && initialEnd.isSame(currentEnd, "day"));

      return !(startSame && endSame);
    } else {
      const initialDate = initialDateRef.current;
      const currentDate = getSelectedDateTime(selectedDate);

      if (!initialDate && !currentDate) return false;
      if (!initialDate || !currentDate) return true;

      if (showTime) {
        return !initialDate.isSame(currentDate, "minute");
      }
      return !initialDate.isSame(currentDate, "day");
    }
  };

  const isValidSelection = range
    ? (selectedRange[0] === null && selectedRange[1] === null) ||
      (selectedRange[0] !== null && selectedRange[1] !== null)
    : true;

  const isApplyDisabled = !isChanged() || !isValidSelection;

  const daysInMonth = currentMonth.daysInMonth();
  const startOfMonth = currentMonth.startOf("month");
  const beginningDay = startOfMonth.day();

  const monthDays = React.useMemo(() => {
    const days: Array<{ date: dayjs.Dayjs; disabled: boolean }> = [];

    const checkDisabled = (date: dayjs.Dayjs) =>
      Boolean(
        (minDate && date.isBefore(dayjs(minDate).startOf("day"))) ||
        (maxDate && date.isAfter(dayjs(maxDate).startOf("day"))),
      );

    for (let idx = 0; idx < beginningDay; idx += 1) {
      const date = startOfMonth.subtract(beginningDay - idx, "day");
      days.push({ date, disabled: checkDisabled(date) });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = startOfMonth.date(day);
      days.push({ date, disabled: checkDisabled(date) });
    }

    const trailing = (7 - (days.length % 7)) % 7;
    for (let idx = 0; idx < trailing; idx += 1) {
      const date = currentMonth.endOf("month").add(idx + 1, "day");
      days.push({ date, disabled: checkDisabled(date) });
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

    if (range) {
      if (!selectedRange[0] || (selectedRange[0] && selectedRange[1])) {
        setSelectedRange([date, null]);
        if (!showActionButtons) {
          onChange?.([date.toDate(), null]);
        }
      } else {
        if (date.isBefore(selectedRange[0])) {
          setSelectedRange([date, null]);
          if (!showActionButtons) {
            onChange?.([date.toDate(), null]);
          }
        } else {
          setSelectedRange([selectedRange[0], date]);
          if (!showActionButtons) {
            onChange?.([selectedRange[0].toDate(), date.toDate()]);
            if (!inline) setIsOpen(false);
          }
          setHoverDate(null);
        }
      }
    } else {
      setSelectedDate(date);
      if (!showActionButtons) {
        onChange?.(date.toDate());
        if (!inline) setIsOpen(false);
      }
    }
  };

  const handleApply = () => {
    if (range) {
      const val =
        selectedRange[0] && selectedRange[1]
          ? [selectedRange[0].toDate(), selectedRange[1].toDate()]
          : null;
      onChange?.(val);
      onApply?.(val);
      if (!inline) setIsOpen(false);
    } else {
      const finalDate = getSelectedDateTime(selectedDate);
      const val = finalDate ? finalDate.toDate() : null;
      onChange?.(val);
      onApply?.(val);
      if (!inline) setIsOpen(false);
    }
  };

  const handleCancel = () => {
    if (range) {
      setSelectedRange(initialRangeRef.current);
      if (initialRangeRef.current[0])
        setCurrentMonth(initialRangeRef.current[0].startOf("month"));
    } else {
      setSelectedDate(initialDateRef.current);
      if (initialDateRef.current)
        setCurrentMonth(initialDateRef.current.startOf("month"));
    }
    onCancel?.();
    if (!inline) setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedDate(null);
    setSelectedRange([null, null]);
  };

  const calendarContent = (
    <div
      className={cn(
        "w-[280px] rounded-[16px] border border-neutral-200 bg-white p-5",
        !inline && "absolute left-0 top-full z-50 mt-2 shadow-xl",
        popupClassName,
      )}
    >
      <div className="pb-4">
        <p className="text-[13px] font-semibold text-neutral-900 mb-4">
          {calendarTitle || `Select Date${range ? " Range" : ""}`}
        </p>
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() =>
              setCurrentMonth((month) => month.subtract(1, "month"))
            }
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[13px] font-medium text-neutral-900 text-center">
            {currentMonth.format("MMMM YYYY")}
          </span>
          <button
            type="button"
            onClick={() => setCurrentMonth((month) => month.add(1, "month"))}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-neutral-500 mb-2">
        {WEEK_DAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {monthDays.map(({ date, disabled }) => {
          const isSelected =
            !range && !!selectedDate && date.isSame(selectedDate, "day");
          const isCurrentMonth = date.month() === currentMonth.month();

          const isRangeStart =
            range && !!selectedRange[0] && date.isSame(selectedRange[0], "day");
          const isRangeEnd =
            range && !!selectedRange[1] && date.isSame(selectedRange[1], "day");
          const isRangeSelected = isRangeStart || isRangeEnd;

          const isBetween =
            range &&
            !!selectedRange[0] &&
            ((!!selectedRange[1] &&
              date.isAfter(selectedRange[0]) &&
              date.isBefore(selectedRange[1])) ||
              (!selectedRange[1] &&
                hoverDate &&
                date.isAfter(selectedRange[0]) &&
                date.isBefore(hoverDate)));

          return (
            <button
              key={date.toString()}
              type="button"
              disabled={disabled}
              onClick={() => handleDaySelect(date)}
              onMouseEnter={() => {
                if (range && selectedRange[0] && !selectedRange[1])
                  setHoverDate(date);
              }}
              className={cn(
                "inline-flex h-8 w-full items-center justify-center text-[13px] font-medium transition-colors rounded-md",
                disabled && "cursor-not-allowed opacity-30",
                (isSelected || isRangeSelected) &&
                  "bg-gradient-to-br from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] text-white shadow-sm",
                isBetween && "bg-purple-100 text-purple-900 rounded-none",
                !(isSelected || isRangeSelected || isBetween) &&
                  !disabled &&
                  isCurrentMonth &&
                  "text-neutral-900 hover:bg-neutral-100",
                !(isSelected || isRangeSelected || isBetween) &&
                  !disabled &&
                  !isCurrentMonth &&
                  "text-neutral-400",
              )}
            >
              {date.date()}
            </button>
          );
        })}
      </div>
      {showTime && (
        <div className="border-t border-neutral-200 mt-3 pt-3">
          <p className="text-sm font-semibold text-neutral-900 mb-2">Time</p>

          <div className="flex items-center gap-2">
            {/* Hour */}
            <input
              type="text"
              value={hour}
                onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "");

          if (value === "" || Number(value) <= 12) {
            setHour(value);
          }
        }}

              maxLength={2}
              placeholder="00"
              className="w-[52px] h-9 rounded-md border border-neutral-300 bg-white px-2 text-center text-sm font-medium text-neutral-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
            />

            <span className="text-sm font-semibold text-neutral-700">:</span>

            {/* Minute */}
            <input
              type="text"
              value={minute}
 onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "");

          if (value === "" || Number(value) <= 59) {
            setMinute(value);
          }
        }}              maxLength={2}
              placeholder="00"
              className="w-[52px] h-9 rounded-md border border-neutral-300 bg-white px-2 text-center text-sm font-medium text-neutral-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
            />

            {/* AM / PM */}
            <div className="ml-1 flex h-9 items-center rounded-xl bg-neutral-100 p-0.5">
              <button
                type="button"
                onClick={() => setAmpm("AM")}
                className={cn(
                  "h-8 min-w-[50px] rounded-lg px-3 text-sm font-medium transition-all",
                  ampm === "AM"
                  ?"bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                AM
              </button>

              <button
                type="button"
                onClick={() => setAmpm("PM")}
                 className={cn(
            "h-8 min-w-[50px] rounded-lg px-3 text-sm font-medium transition-all",
            ampm === "PM"
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-900"
          )}
              >
                PM
              </button>
            </div>
          </div>
        </div>
      )}

      {showActionButtons && (
        <div className="mt-6 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasSelectedValue}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium transition-colors",
              hasSelectedValue
                ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-pointer"
                : "bg-neutral-50 text-neutral-400 cursor-not-allowed opacity-50",
            )}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className={cn(
              "rounded-md px-4 py-1.5 text-xs font-medium text-white hover:opacity-90",
              !isApplyDisabled
                ? "bg-gradient-to-br from-[var(--color-brand-purple)] to-[var(--color-brand-blue)] cursor-pointer"
                : "bg-neutral-500 cursor-not-allowed opacity-50",
            )}
            disabled={isApplyDisabled}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );

  if (inline) {
    return <div className={cn("w-full", className)}>{calendarContent}</div>;
  }

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
        <span
          className={cn(
            "truncate text-left text-sm",
            selectedLabel ? "text-neutral-900" : "text-neutral-500",
          )}
        >
          {selectedLabel || placeholder}
        </span>
        <CalendarDays className="h-4 w-4 text-neutral-400" />
      </button>
      {isOpen && calendarContent}
    </div>
  );
}
