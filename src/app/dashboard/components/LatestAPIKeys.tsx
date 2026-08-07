"use client";
import React, { useEffect } from "react";
import { keymanagementService } from "@/services/keymanagementService";
import { SearchInput } from "@/components/common/SearchInput";
import { CommonTable } from "@/components/common/CommonTable";
import { Copy } from "lucide-react";
import { formatLastUsed } from "@/components/common/CommonFunctions";

export interface ApiKey {
  id: string;
  workspace_id: string;
  workspace_name: string;
  owner: string;
  provider: string;
  key: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-neutral-100 rounded transition-colors cursor-pointer text-neutral-400 hover:text-neutral-900 inline-flex items-center justify-center border-none outline-none shrink-0"
      title="Copy key prefix"
    >
      {copied ? (
        <span className="text-emerald-600 text-xs font-semibold">✓</span>
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
};

export default function LatestAPIKeys() {
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const keys = await keymanagementService.getAllAPIkeys();
        setApiKeys(keys || []);
      } catch (error) {
        console.error("Error fetching API keys:", error);
      }
    };
    fetchData();
  }, []);

  const handleEditApiKey = (apiKey: ApiKey) => {
    console.log("Edit API Key:", apiKey);
  };

  const handleDeleteApiKey = (apiKey: ApiKey) => {
    console.log("Delete API Key:", apiKey);
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200 mt-6 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">
        Latest API Keys
      </h3>
      <div className="flex justify-between items-center w-full mb-6">
        <div className="w-[320px]">
          <SearchInput
            placeholder="Search workspaces, users and keys..."
            className="bg-[#FAFAFA]"
          />
        </div>
        <button className="bg-[var(--color-gray-100)] text-[var(--color-brand-purple)] text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer hover:bg-[var(--color-gray-d2)] border-none outline-none">
          Create New Key
        </button>
      </div>

      <CommonTable
        data={apiKeys}
        columns={[
          {
            key: "workspace_name",
            title: "Workspace",
            className: "font-medium text-zinc-900",
          },
          { key: "owner", title: "User Name" },
          { key: "provider", title: "Provider" },
          {
            key: "key_prefix",
            title: "Key",
            render: (row) => (
              <div className="flex items-center gap-1.5">
                <span
                  className="truncate max-w-[150px] inline-block align-middle"
                  title={row.key_prefix}
                >
                  {row.key_prefix}
                </span>
                <CopyButton text={row.key_prefix} />
              </div>
            ),
          },
          {
            key: "is_active",
            title: "Status",
            render: (row) =>
              row.is_active ? (
                <span className="bg-[#BBF7D0] text-[#166534] px-2.5 py-0.5 rounded-md text-xs font-medium shadow-sm">
                  Enabled
                </span>
              ) : (
                <span className="bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-md text-xs font-medium inline-block">
                  Disabled
                </span>
              ),
          },
          {
            key: "last_used_at",
            title: "Last Used",
            render: (row) => formatLastUsed(row.last_used_at),
          },
          { key: "created_at", title: "Created" },
        ]}
        actions={(row) => [
          {
            label: "Edit",
            onClick: () => handleEditApiKey(row),
          },
          {
            label: "Delete",
            onClick: () => handleDeleteApiKey(row),
          },
        ]}
        headerClassName="text-[#737373] text-sm font-medium"
        bodyClassName="text-sm text-[#525252] font-normal py-4"
      />
    </div>
  );
}
