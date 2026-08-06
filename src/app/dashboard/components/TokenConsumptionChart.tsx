"use client";

import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { dashboardService, DailyAnalyticsResponse } from "@/services/dashboardService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
};

export default function TokenConsumptionChart() {
  const [data, setData] = useState<DailyAnalyticsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("Today");
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [rangeStart, setRangeStart] = useState<dayjs.Dayjs | null>(null);
  const [rangeEnd, setRangeEnd] = useState<dayjs.Dayjs | null>(null);
  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(dayjs().startOf("month"));

  const daysInMonth = currentMonth.daysInMonth();
  const startOfMonth = currentMonth.startOf("month");
  const beginningDay = startOfMonth.day();

  const monthDays = React.useMemo(() => {
    const days: Array<{ date: dayjs.Dayjs; disabled: boolean }> = [];
    for (let idx = 0; idx < beginningDay; idx += 1) {
      days.push({ date: startOfMonth.subtract(beginningDay - idx, "day"), disabled: true });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({ date: startOfMonth.date(day), disabled: false });
    }
    const trailing = (7 - (days.length % 7)) % 7;
    for (let idx = 0; idx < trailing; idx += 1) {
      days.push({ date: currentMonth.endOf("month").add(idx + 1, "day"), disabled: true });
    }
    return days;
  }, [beginningDay, currentMonth, daysInMonth, startOfMonth]);

  const handleDaySelect = (date: dayjs.Dayjs) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
    } else if (date.isBefore(rangeStart, "day")) {
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      setRangeEnd(date);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getDailyAnalytics();
        setData(response);
      } catch (error) {
        console.error("Failed to fetch daily analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 h-[400px] animate-pulse"></div>;
  }

  if (!data || data.length === 0) return null;

  const totalTokens = data.reduce((sum, item) => sum + item.total_tokens, 0);
  const avgTokens = totalTokens / data.length;
  const maxItem = [...data].sort((a, b) => b.total_tokens - a.total_tokens)[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Token Consumption</h2> 
          <div className="flex gap-2">
            <div className="bg-zinc-50 border border-zinc-100 rounded-md p-3">
              <p className="text-xs text-neutral-500 font-medium mb-1">Total Usage</p>
              <p className="text-sm font-semibold text-neutral-900">{formatNumber(totalTokens)} Tokens</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-md p-3">
              <p className="text-xs text-neutral-500 font-medium mb-1">Average/Day</p>
              <p className="text-sm font-semibold text-neutral-900">{formatNumber(avgTokens)} Tokens</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-md p-3">
              <p className="text-xs text-neutral-500 font-medium mb-1">Highest Usage</p>
              <p className="text-sm font-semibold text-neutral-900">{formatNumber(maxItem.total_tokens)} • {formatDate(maxItem.period)}</p>
            </div>
          </div>
        </div>
        
        <div className="w-[150px] shrink-0 relative">
          <Select value={selectedRange} onValueChange={(value) => {
            if (value) {
              setSelectedRange(value);
              setShowCustomRange(value === "Custom range");
            }
          }}>
            <SelectTrigger className="w-full h-8 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              <SelectItem value="Today" className="text-xs">Today</SelectItem>
              <SelectItem value="Last 7 days" className="text-xs">Last 7 days</SelectItem>
              <SelectItem value="Custom range" className="text-xs">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {showCustomRange && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[280px] rounded-[16px] border border-neutral-200 bg-white p-5 shadow-xl">
              <div className="pb-4">
                <p className="text-[13px] font-semibold text-neutral-900 mb-4">Select Date Range</p>
                <div className="flex items-center justify-between px-2">
                  <button
                    type="button"
                    onClick={() => setCurrentMonth((month) => month.subtract(1, "month"))}
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
                  const isSelected = (rangeStart && date.isSame(rangeStart, "day")) || (rangeEnd && date.isSame(rangeEnd, "day"));
                  const isBetween = rangeStart && rangeEnd && date.isAfter(rangeStart, "day") && date.isBefore(rangeEnd, "day");
                  const isCurrentMonth = date.month() === currentMonth.month();
                  return (
                    <button
                      key={date.toString()}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleDaySelect(date)}
                      className={cn(
                        "inline-flex h-8 w-full items-center justify-center text-[13px] font-medium transition-colors rounded-md",
                        disabled && "opacity-30 cursor-not-allowed",
                        isSelected && "bg-purple-600 text-white shadow-sm",
                        isBetween && "bg-purple-100 text-purple-900 rounded-none",
                        !isSelected && !isBetween && !disabled && isCurrentMonth && "text-neutral-900 hover:bg-neutral-100",
                        !isSelected && !isBetween && !disabled && !isCurrentMonth && "text-neutral-400"
                      )}
                    >
                      {date.date()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomRange(false);
                    setSelectedRange("Today");
                    setRangeStart(null);
                    setRangeEnd(null);
                  }}
                  className="rounded-md bg-neutral-100 px-4 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomRange(false)}
                  className="rounded-md bg-neutral-500 px-4 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-[280px] w-full mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 0,
              left: -15,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#AC6AEE" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#AC6AEE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
            <XAxis 
              dataKey="period" 
              tickFormatter={formatDate}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#737373" }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => formatNumber(val)}
              tick={{ fontSize: 12, fill: "#737373" }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: "8px", border: "1px solid #E5E5E5", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              labelFormatter={(label) => {
                const labelText = typeof label === "string" || typeof label === "number" ? String(label) : "";
                return labelText ? formatDate(labelText) : "";
              }}
              formatter={(value) => {
                const numericValue = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0);
                return [numericValue.toLocaleString(), "Tokens"] as [string, string];
              }}
            />
            <Area
              type="monotone"
              dataKey="total_tokens"
              stroke="#AC6AEE"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTokens)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
