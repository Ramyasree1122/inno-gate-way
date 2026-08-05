"use client";
import { keymanagementService } from "@/services/keymanagementService";
import React, { useEffect } from "react";
import { SquarePen, Trash2 } from "lucide-react";
import { SearchInput } from "@/components/common/SearchInput";
import { CommonTable } from "@/components/common/CommonTable";
import { Copy, ChevronRight } from "lucide-react";
import {
  formatLastUsed,
  formatExpiresOn,
} from "@/components/common/CommonFunctions";

interface Workspace {
  id: string;
  name: string;
  created_by?: string;
  created_at?: string;
}

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

export default function KeyManagementPage() {
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const workspaces = await keymanagementService.getAllWorkspaces();
        setWorkspaces(workspaces || []);
        const apiKeys = await keymanagementService.getAllAPIkeys();
        setApiKeys(apiKeys || []);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    };

    fetchData();
  }, []);

  const handleEditWorkspace = (workspace: Workspace) => {
    console.log("Edit workspace:", workspace);
    // Add edit functionality here
  };

  const handleDeleteWorkspace = (workspace: Workspace) => {
    console.log("Delete workspace:", workspace);
    // Add delete functionality here
  };

  const handleEditApiKey = (apiKey: ApiKey) => {
    console.log("Edit API Key:", apiKey);
  };

  const handleDeleteApiKey = (apiKey: ApiKey) => {
    console.log("Delete API Key:", apiKey);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h1 className="text-2xl font-semibold text-zinc-950 mb-4">
        Key Management
      </h1>

      {/* Workspaces Section */}
      <div className="bg-white rounded-lg p-3 mb-4 border border-neutral-200">
        <h2 className="text-neutral-900 text-xl font-semibold mb-4">
          Workspaces
        </h2>
        <div className="flex justify-between items-center w-full mb-4">
          <div className="w-72">
            <SearchInput placeholder="Search workspaces..." />
          </div>
          <button className="bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#9333EA] text-sm font-medium px-3 py-2 rounded-md shadow-xs transition-colors cursor-pointer">
            Create Workspace
          </button>
        </div>

        <CommonTable
          data={workspaces}
          columns={[
            { key: "name", title: "Workspace" },
            { key: "created_by", title: "Created by" },
            { key: "created_at", title: "Created on" },
          ]}
          onEdit={handleEditWorkspace}
          onDelete={handleDeleteWorkspace}
          headerClassName="text-[#737373] text-sm font-medium"
          bodyClassName="text-sm text-[#0A0A0A] font-normal"
        />
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-lg p-3 border border-neutral-200">
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">
          API keys
        </h3>
        <div className="flex justify-between items-center w-full mb-4">
          <div className="w-72">
            <SearchInput placeholder="Search API keys..." />
          </div>
          <button className="bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#9333EA] text-sm font-medium px-3 py-2 rounded-md shadow-xs transition-colors cursor-pointer">
            Create API Key
          </button>
        </div>

        <CommonTable
          data={apiKeys}
          columns={[
            { key: "workspace_name", title: "Workspace" },
            { key: "owner", title: "User Email" },
            { key: "provider", title: "Provider" },
            {
              key: "key_prefix",
              title: "Key Prefix",
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
                  <span className="bg-[#BBF7D0] text-[#166534]  px-2 py-0.5 rounded-md text-xs font-medium  shadow-sm">
                    Enabled
                  </span>
                ) : (
                  <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md text-xs font-medium inline-block">
                    Disabled
                  </span>
                ),
            },
            {
              key: "last_used_at",
              title: "Last Used",
              render: (row) => formatLastUsed(row.last_used_at),
            },
            { key: "created_at", title: "Created on" },
            {
              key: "expires_at",
              title: "Expires on",
              render: (row) => formatExpiresOn(row.expires_at),
            },
          ]}
          onEdit={handleEditApiKey}
          onDelete={handleDeleteApiKey}
          headerClassName="text-[#737373] text-sm font-medium"
          bodyClassName="text-sm text-[#0A0A0A] font-normal"
        />
      </div>
    </div>
  );
}
