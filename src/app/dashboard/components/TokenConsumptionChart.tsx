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
        
        <div className="w-[150px] shrink-0">
          <Select defaultValue="Today">
            <SelectTrigger className="w-full h-8 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              <SelectItem value="Today" className="text-xs">Today</SelectItem>
              <SelectItem value="Last 7 days" className="text-xs">Last 7 days</SelectItem>
              <SelectItem value="Custom range" className="text-xs">Custom range</SelectItem>
            </SelectContent>
          </Select>
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
