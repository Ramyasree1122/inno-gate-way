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
import { CommonModal } from "@/components/common/CommonModal";

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

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState("");
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingWorkspace, setEditingWorkspace] =
    React.useState<Workspace | null>(null);
  const [editWorkspaceName, setEditWorkspaceName] = React.useState("");

  const fetchWorkspaces = async () => {
    try {
      const workspaces = await keymanagementService.getAllWorkspaces();
      setWorkspaces(workspaces || []);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const apiKeys = await keymanagementService.getAllAPIkeys();
      setApiKeys(apiKeys || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchWorkspaces();
        await fetchApiKeys();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setEditWorkspaceName(workspace.name);
    setIsEditModalOpen(true);
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

  const handleCreateWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      const response =
        await keymanagementService.createWorkspace(newWorkspaceName);
      if (response) {
        await fetchWorkspaces();
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
    setIsCreateModalOpen(false);
    setNewWorkspaceName("");
  };

  const handleEditWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkspace || !editWorkspaceName.trim()) return;
    try {
      const response = await keymanagementService.updateWorkspace(
        editingWorkspace.id,
        editWorkspaceName,
      );
      if (response) {
        await fetchWorkspaces();
      }
    } catch (error) {
      console.error("Error updating workspace:", error);
    }
    setIsEditModalOpen(false);
    setEditingWorkspace(null);
    setEditWorkspaceName("");
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h1 className="text-2xl font-semibold text-zinc-950 mb-4">
        Key Management
      </h1>

      {/* Create Workspace Modal */}
      <CommonModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewWorkspaceName("");
        }}
        title="Create Workspace"
        className="max-w-[380px]"
      >
        <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0A0A0A]">
              Workspace name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter a workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="flex w-full rounded-md border border-[#E5E5E5] px-3 py-2 text-sm placeholder:text-[#737373] focus-visible:outline-none shadow-xs shadow-[#E5E5E5]"
            />
          </div>
          <button
            type="submit"
            disabled={!newWorkspaceName.trim()}
            className={`w-full py-2 rounded-md font-medium text-sm transition-colors mt-2 ${
              newWorkspaceName.trim()
                ? "bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-white cursor-pointer"
                : "bg-[#171717] text-white cursor-not-allowed opacity-50"
            }`}
          >
            Create
          </button>
        </form>
      </CommonModal>

      {/* Edit Workspace Modal */}
      <CommonModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingWorkspace(null);
          setEditWorkspaceName("");
        }}
        title="Edit Workspace Name"
        className="max-w-[380px]"
      >
        <form onSubmit={handleEditWorkspaceSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0A0A0A]">
              Workspace name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter a workspace name"
              value={editWorkspaceName}
              onChange={(e) => setEditWorkspaceName(e.target.value)}
              className="flex w-full rounded-md border border-[#E5E5E5] px-3 py-2 text-sm placeholder:text-[#737373] focus-visible:outline-none shadow-xs shadow-[#E5E5E5]"
            />
          </div>
          <button
            type="submit"
            disabled={!editWorkspaceName.trim()}
            className={`w-full py-2 rounded-md font-medium text-sm transition-colors mt-2 ${
              editWorkspaceName.trim()
                ? "bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-white cursor-pointer"
                : "bg-neutral-300 text-white cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </form>
      </CommonModal>

      {/* Workspaces Section */}
      <div className="bg-white rounded-lg p-3 mb-4 border border-neutral-200">
        <h2 className="text-neutral-900 text-xl font-semibold mb-4">
          Workspaces
        </h2>
        <div className="flex justify-between items-center w-full mb-4">
          <div className="w-72">
            <SearchInput
              placeholder="Search workspaces..."
              className="text-xs font-normal text-[#737373] "
              containerClassName="rounded-md border-[#E5E5E5] shadow-xs"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#9333EA] text-sm font-medium px-3 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
          >
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
            <SearchInput
              placeholder="Search workspaces,users and API keys..."
              className="text-xs font-normal text-[#737373]"
              containerClassName="rounded-md border-[#E5E5E5] shadow-xs"
            />
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
                  <span className="bg-[#F5F5F5] text-[#171717] border-[#FFFFFF] px-2 py-0.5 rounded-md text-xs font-medium">
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
