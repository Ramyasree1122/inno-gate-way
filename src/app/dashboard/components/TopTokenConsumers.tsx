"use client";

import React, { useEffect, useState } from "react";
import { LoaderIcon } from "lucide-react";
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
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getTopUsers(selectedPeriod);
        setData(response);
      } catch (error) {
        console.error("Failed to fetch top users", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedPeriod]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-6 h-full flex flex-col">
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <LoaderIcon className="w-8 h-8 animate-spin text-neutral-900" />
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">Top Token Consumers</h2>
        
        <div className="w-[150px] shrink-0">
          <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value || "all")}>
            <SelectTrigger className="w-full h-8 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md">
              {/* show mapped label text inside trigger so the displayed text matches dropdown option */}
              <span className="truncate">
                {selectedPeriod === "all" && "All Time"}
                {selectedPeriod === "24h" && "Last 24 Hours"}
                {selectedPeriod === "week" && "Last Week"}
                {selectedPeriod === "month" && "Last Month"}
                {!selectedPeriod && "Select range"}
              </span>
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              <SelectItem value="all" className="text-xs">All Time</SelectItem>
              <SelectItem value="24h" className="text-xs">Last 24 Hours</SelectItem>
              <SelectItem value="week" className="text-xs">Last Week</SelectItem>
              <SelectItem value="month" className="text-xs">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {data && data.length > 0 ? (
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
