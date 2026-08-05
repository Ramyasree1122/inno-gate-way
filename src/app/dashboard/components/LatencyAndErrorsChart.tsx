"use client";

import React, { useEffect, useState } from "react";
import {
  dashboardService,
  DailyAnalyticsResponse,
} from "@/services/dashboardService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
};

const LeftAxisLabel = ({ viewBox }: any) => {
  const x = viewBox.x + 16;
  const y = viewBox.y + viewBox.height / 2;
  return (
    <g>
      <text x={x} y={y} transform={`rotate(-90, ${x}, ${y})`} textAnchor="middle" fill="#171717" fontSize={12} fontWeight={500}>
        Latency
      </text>
      <path d={`M ${x - 4} ${y - 50} L ${x} ${y - 56} L ${x + 4} ${y - 50} M ${x} ${y - 56} L ${x} ${y - 38}`} stroke="#171717" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );
};

const RightAxisLabel = ({ viewBox }: any) => {
  const x = viewBox.x + viewBox.width - 16;
  const y = viewBox.y + viewBox.height / 2;
  return (
    <g>
      <text x={x} y={y} transform={`rotate(-90, ${x}, ${y})`} textAnchor="middle" fill="#171717" fontSize={12} fontWeight={500}>
        Errors
      </text>
      <path d={`M ${x - 4} ${y - 50} L ${x} ${y - 56} L ${x + 4} ${y - 50} M ${x} ${y - 56} L ${x} ${y - 38}`} stroke="#171717" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  );
};

export default function LatencyAndErrorsChart() {
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
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 h-[400px] animate-pulse"></div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">
          Latency and errors
        </h2>

        <div className="w-[150px] shrink-0">
          <Select defaultValue="Last 7 days">
            <SelectTrigger className="w-full h-8 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              <SelectItem value="Last 3 days" className="text-xs">
                Last 3 days
              </SelectItem>
              <SelectItem value="Last 7 days" className="text-xs">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#E5E5E5"
            />

            <XAxis
              dataKey="period"
              tickFormatter={formatDate}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#737373" }}
              dy={10}
              minTickGap={18}
            />

            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#737373" }}
              domain={[0, 16000]}
              ticks={[0, 4000, 8000, 12000, 16000]}
              width={70}
              label={<LeftAxisLabel />}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#737373" }}
              domain={[0, 20]}
              ticks={[0, 5, 10, 15, 20]}
              width={52}
              label={<RightAxisLabel />}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E5E5",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelFormatter={(label) => {
                const labelText =
                  typeof label === "string" || typeof label === "number"
                    ? String(label)
                    : "";
                return labelText ? formatDate(labelText) : "";
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value, entry: any) => (
                <span style={{ color: "var(--color-slate-700, #334155)", fontWeight: 500, marginLeft: "4px", marginRight: "12px" }}>{value}</span>
              )}
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "12px",
                display: "flex",
                justifyContent: "center",
              }}
            />

            <Line
              yAxisId="left"
              type="linear"
              dataKey="avg_latency_ms"
              name="Latency(ms)"
              stroke="#7E22CE"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Line
              yAxisId="right"
              type="linear"
              dataKey="errors"
              name="Error"
              stroke="#DC2626"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
