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
import { CommonCalendar, formatDateRangeDisplay } from "@/components/common/CommonCalendar";

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const displayDate = dayjs(label).format("DD MMM YYYY");

    return (
      <div className="bg-white rounded-lg border border-[#E5E5E5] shadow-lg min-w-[320px] overflow-hidden">
        <div className="flex justify-between items-center px-4 py-2 bg-[var(--color-gray-f3)] border-b border-[#E5E5E5]">
          <span className="text-sm font-semibold text-neutral-800">Usage Summary</span>
          <span className="text-[13px] text-neutral-500">{displayDate}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-y-4 gap-x-2 p-4">
          <div>
            <p className="text-[13px] text-neutral-500 mb-1">Tokens used</p>
            <p className="text-[15px] font-semibold text-neutral-900">{data.total_tokens?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[13px] text-neutral-500 mb-1">Completion Tokens</p>
            <p className="text-[15px] font-semibold text-neutral-900">{data.completion_tokens?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[13px] text-neutral-500 mb-1">Prompt Tokens</p>
            <p className="text-[15px] font-semibold text-neutral-900">{data.prompt_tokens?.toLocaleString()}</p>
          </div>
          
          <div>
            <p className="text-[13px] text-blue-500 mb-1">Requests</p>
            <p className="text-[15px] font-semibold text-neutral-900">{data.requests?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[13px] text-emerald-500 mb-1">Tokens Saved</p>
            <p className="text-[15px] font-semibold text-neutral-900">{data.optimizer_saved_tokens?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[13px] text-yellow-500 mb-1">Peak Hour</p>
            <p className="text-[15px] font-semibold text-neutral-900">-</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function TokenConsumptionChart() {
  const [data, setData] = useState<DailyAnalyticsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState("Today");
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [rangeStart, setRangeStart] = useState<dayjs.Dayjs | null>(null);
  const [rangeEnd, setRangeEnd] = useState<dayjs.Dayjs | null>(null);

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

  const hasData = data && data.length > 0;
  const totalTokens = hasData ? data.reduce((sum, item) => sum + item.total_tokens, 0) : 0;
  const avgTokens = hasData ? totalTokens / data.length : 0;
  const maxItem = hasData ? [...data].sort((a, b) => b.total_tokens - a.total_tokens)[0] : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Token Consumption</h2> 
          <div className="flex gap-2">
            <div className="bg-zinc-50 border border-zinc-100 rounded-md p-3">
              <p className="text-xs text-neutral-500 font-medium mb-1">Total Usage</p>
              <p className="text-sm font-semibold text-neutral-900">{hasData ? `${formatNumber(totalTokens)} Tokens` : "-"}</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-md p-3">
              <p className="text-xs text-neutral-500 font-medium mb-1">Average/Day</p>
              <p className="text-sm font-semibold text-neutral-900">{hasData ? `${formatNumber(avgTokens)} Tokens` : "-"}</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-md p-3">
              <p className="text-xs text-neutral-500 font-medium mb-1">Highest Usage</p>
              <p className="text-sm font-semibold text-neutral-900">{hasData && maxItem ? `${formatNumber(maxItem.total_tokens)} • ${formatDate(maxItem.period)}` : "-"}</p>
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
              {selectedRange === "Custom range" && rangeStart && rangeEnd ? (
                <span className="truncate">
                  {formatDateRangeDisplay(rangeStart, rangeEnd, "D MMM")}
                </span>
              ) : (
                <SelectValue placeholder="Select range" />
              )}
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              <SelectItem value="Today" className="text-xs">Today</SelectItem>
              <SelectItem value="Last 7 days" className="text-xs">Last 7 days</SelectItem>
              <SelectItem value="Custom range" className="text-xs">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {showCustomRange && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50">
              <CommonCalendar
                range
                inline
                showActionButtons
                value={rangeStart && rangeEnd ? [rangeStart.toDate(), rangeEnd.toDate()] : null}
                onApply={(val: any) => {
                  if (Array.isArray(val)) {
                    if (val[0] && val[1]) {
                      setRangeStart(dayjs(val[0]));
                      setRangeEnd(dayjs(val[1]));
                      setShowCustomRange(false);
                    }
                  } else if (val) {
                    setRangeStart(dayjs(val));
                    setRangeEnd(dayjs(val));
                    setShowCustomRange(false);
                  }
                }}
                onCancel={() => {
                  setShowCustomRange(false);
                  setSelectedRange("Today");
                  setRangeStart(null);
                  setRangeEnd(null);
                }}
                popupClassName="shadow-xl"
              />
            </div>
          )}
        </div>
      </div>

      <div className="h-[280px] w-full mt-8">
        {hasData ? (
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
              content={<CustomTooltip />}
              cursor={{ stroke: '#E5E5E5', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }}
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
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
