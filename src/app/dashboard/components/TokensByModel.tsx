"use client";

import { useEffect, useState } from "react";
import { CommonTable } from "@/components/common/CommonTable";
import { dashboardService, TokensByModelResponse } from "@/services/dashboardService";

const formatNumber = (value?: number | null) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value ?? 0);

export default function TokensByModel() {
  const [rows, setRows] = useState<TokensByModelResponse[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getTokensByModel();
        setRows(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching tokens by model:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200 mt-6 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">Tokens by model</h3>

      <CommonTable
        data={rows}
        columns={[
          {
            key: "model",
            title: "Model",
            render: (row) => (
              <span className="font-medium text-zinc-900">
                {row.model}
              </span>
            ),
          },
          {
            key: "requests",
            title: "Requests",
            render: (row) => formatNumber(row.requests),
          },
          {
            key: "total_tokens",
            title: "Total Tokens",
            render: (row) => formatNumber(row.total_tokens),
          },
          {
            key: "avg_latency_ms",
            title: "Avg Latency (ms)",
            render: (row) => row.avg_latency_ms?.toFixed(2) || "-",
          },
        ]}
        headerClassName="text-[#737373] text-sm font-medium"
        bodyClassName="text-sm text-[#525252] font-normal py-4"
        emptyMessage="No token usage data available."
      />
    </div>
  );
}
