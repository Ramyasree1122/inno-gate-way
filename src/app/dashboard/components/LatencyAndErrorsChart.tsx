"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const staticData = [
  { date: "26 Jun", latency: 6500, error: 8 },
  { date: "27 Jun", latency: 9500, error: 3 },
  { date: "28 Jun", latency: 8500, error: 5 },
  { date: "29 Jun", latency: 10000, error: 14 },
  { date: "30 Jun", latency: 4000, error: 1 },
  { date: "1 Jul", latency: 5000, error: 3 },
  { date: "2 Jul", latency: 9500, error: 5 },
];

export default function LatencyAndErrorsChart() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">Latency and errors</h2>
        
        <div className="w-[140px] shrink-0">
          <Select defaultValue="Last 7 days">
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

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={staticData}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
            
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#737373" }}
              dy={10}
            />
            
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#737373" }}
              domain={[0, 16000]}
              ticks={[0, 4000, 8000, 12000, 16000]}
              label={{ value: 'Latency', angle: -90, position: 'insideLeft', fill: '#171717', fontSize: 12, fontWeight: 500, dx: -20 }}
            />
            
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#737373" }}
              domain={[0, 20]}
              ticks={[0, 5, 10, 15, 20]}
              label={{ value: 'Errors', angle: -90, position: 'insideRight', fill: '#171717', fontSize: 12, fontWeight: 500, dx: 20 }}
            />
            
            <Tooltip 
              contentStyle={{ borderRadius: "8px", border: "1px solid #E5E5E5", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
            
            <Legend 
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', color: '#171717', paddingTop: '20px' }}
            />

            <Line 
              yAxisId="left"
              type="linear" 
              dataKey="latency" 
              name="Latency(ms)"
              stroke="#AC6AEE" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 6 }} 
            />
            
            <Line 
              yAxisId="right"
              type="linear" 
              dataKey="error" 
              name="Error"
              stroke="#EF4444" 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
