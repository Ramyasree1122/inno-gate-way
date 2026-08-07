"use client";

import { useEffect, useState } from "react";
import { CommonTable } from "@/components/common/CommonTable";
import { dashboardService } from "@/services/dashboardService";

export interface AvailableModel {
  provider_name: string;
  provider_id: string;
  model: string;
  configured: boolean;
  enabled: boolean;
  active: boolean;
}

const BooleanBadge = ({ value }: { value: boolean }) => (
  <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium`}>
    {value ? "Yes" : "No"}
  </span>
);

export default function AvailableModels() {
  const [rows, setRows] = useState<AvailableModel[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const providers = await dashboardService.getProviders();
        const flattened: AvailableModel[] = [];

        (Array.isArray(providers) ? providers : []).forEach((provider: any) => {
          if (provider.models && provider.models.length > 0) {
            provider.models.forEach((model: any) => {
              flattened.push({
                provider_name: provider.name,
                provider_id: provider.id,
                model: model.display_name || model.id,
                configured: provider.configured,
                enabled: provider.enabled,
                active: provider.active,
              });
            });
          } else {
            flattened.push({
              provider_name: provider.name,
              provider_id: provider.id,
              model: "No models available",
              configured: provider.configured,
              enabled: provider.enabled,
              active: provider.active,
            });
          }
        });

        setRows(flattened);
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200 mt-6 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">Available models</h3>

      <CommonTable
        data={rows}
        columns={[
          {
            key: "provider_name",
            title: "Provider",
            render: (row) => (
              <span className="font-medium text-zinc-900">
                {row.provider_name}
              </span>
            ),
          },
          {
            key: "model",
            title: "Model",
            render: (row) => row.model,
          },
          {
            key: "configured",
            title: "Configured",
            render: (row) => <BooleanBadge value={row.configured} />,
          },
          {
            key: "enabled",
            title: "Enabled",
            render: (row) => <BooleanBadge value={row.enabled} />,
          },
          {
            key: "active",
            title: "Active",
            render: (row) => <BooleanBadge value={row.active} />,
          },
        ]}
        headerClassName="text-[#737373] text-sm font-medium"
        bodyClassName="text-sm text-[#525252] font-normal py-4"
        emptyMessage="No providers available."
      />
    </div>
  );
}
