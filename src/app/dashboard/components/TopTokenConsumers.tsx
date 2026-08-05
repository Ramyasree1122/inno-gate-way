"use client";

import React, { useEffect, useState } from "react";
import { dashboardService, TopUserResponse } from "@/services/dashboardService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TopTokenConsumers() {
  const [data, setData] = useState<TopUserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getTopUsers("all");
        setData(response);
      } catch (error) {
        console.error("Failed to fetch top users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">Top Token Consumers</h2>
        
        <div className="w-[140px] shrink-0">
          <Select defaultValue="Last 24 hours">
            <SelectTrigger className="w-full h-8 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              <SelectItem value="Last 24 hours" className="text-xs">Last 24 hours</SelectItem>
              <SelectItem value="Last 7 days" className="text-xs">Last 7 days</SelectItem>
              <SelectItem value="All time" className="text-xs">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-zinc-100 rounded-md"></div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-0">
            {data.map((user, index) => (
              <div 
                key={index} 
                className={`flex justify-between items-center py-4 text-sm ${index !== data.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}
              >
                <span className="text-neutral-900 font-medium truncate pr-4">{user.owner}</span>
                <span className="text-neutral-500 whitespace-nowrap">{user.total_tokens.toLocaleString()} tokens</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-neutral-500 text-center py-8">No data available</div>
        )}
      </div>
    </div>
  );
}
