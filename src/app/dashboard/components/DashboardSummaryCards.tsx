"use client";

import React, { useEffect, useState } from "react";
import {
  Coins,
  Users,
  Activity,
  Key,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import {
  dashboardService,
  DashboardSummaryResponse,
} from "@/services/dashboardService";
import SvgIcon from "@/components/svgIcons";

export default function DashboardSummaryCards() {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await dashboardService.getDashboardSummary();
        setData(response);
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-[#E5E5E5] h-20 animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (!data) {
    return null; // Or some error state if desired
  }

  const cards = [
    {
      title: "Total Tokens",
      value: data.total_tokens.toLocaleString(),
      icon: "total-tokens-icon",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Total Users",
      value: data.active_users.toLocaleString(), // Mapping to active_users based on available API data
      icon: "total-saved-icon",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "API Requests",
      value: data.total_requests.toLocaleString(),
      icon: "api-request-icon",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Active Keys",
      value: data.active_api_keys.toLocaleString(),
      icon: "active-key-icon",
      bgColor: "bg-orange-50",
    },
    {
      title: "Active users",
      value: data.active_users.toLocaleString(),
      icon: "active-user-icon",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Error rate",
      value: `${data.error_rate.toFixed(2)}%`,
      icon: "error-rate-icon",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="flex items-center gap-3 bg-white p-4 border border-[#E5E5E5] rounded-xl shadow-sm"
        >
          <div
            className={`p-2 rounded-lg flex-shrink-0 flex items-center justify-center ${card.bgColor}`}
          >
            {/* <card.icon className={`w-5 h-5 ${card.textColor}`} strokeWidth={2} /> */}
            <SvgIcon type={card.icon} width={21} height={23} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[var(--color-slate-700)]">
              {card.title}
            </span>

            <span className="text-lg font-bold text-[var(--color-neutral-565656)] leading-tight">
              {card.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
