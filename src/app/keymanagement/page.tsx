"use client";
import { keymanagementService } from "@/services/keymanagementService";
import React, { useEffect } from "react";
import { SearchInput } from "@/components/common/SearchInput";
import { CommonTable } from "@/components/common/CommonTable";
import { Copy } from "lucide-react";
import {
  formatLastUsed,
  formatExpiresOn,
} from "@/components/common/CommonFunctions";
import { CommonModal } from "@/components/common/CommonModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  created_by?: string;
  created_at?: string;
  isDelete?: boolean;
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

const CopyButton = ({
  text,
  disabled,
}: {
  text: string;
  disabled?: boolean;
}) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    if (disabled) return;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      disabled={disabled}
      onClick={handleCopy}
      className={`p-1 rounded transition-colors inline-flex items-center justify-center border-none outline-none shrink-0 ${
        disabled
          ? "cursor-not-allowed text-neutral-300 opacity-50"
          : "cursor-pointer text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
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
  const [ApiKeyModalOpen, setApiKeyModalOpen] = React.useState(false);
  const [activeApiKey, setActiveApiKey] = React.useState<
    | (ApiKey & {
        mode?:
          | "change_workspace"
          | "extend"
          | "regenerate"
          | "disable"
          | "delete";
      })
    | null
  >(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState("");

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
    setEditingWorkspace({ ...workspace, isDelete: true });
    setIsEditModalOpen(true);
  };

  const handleChangeWorkspace = (apiKey: ApiKey) => {
    setActiveApiKey({ ...apiKey, mode: "change_workspace" });
    setSelectedWorkspaceId(apiKey.workspace_id);
    setApiKeyModalOpen(true);
  };

  const handleExtendDuration = (apiKey: ApiKey) => {
    setActiveApiKey({ ...apiKey, mode: "extend" });
    setApiKeyModalOpen(true);
  };

  const handleRegenerateKey = (apiKey: ApiKey) => {
    setActiveApiKey({ ...apiKey, mode: "regenerate" });
    setApiKeyModalOpen(true);
  };

  const handleDisableApiKey = (apiKey: ApiKey) => {
    setActiveApiKey({ ...apiKey, mode: "disable" });
    setApiKeyModalOpen(true);
  };

  const handleDeleteApiKey = (apiKey: ApiKey) => {
    setActiveApiKey({ ...apiKey, mode: "delete" });
    setApiKeyModalOpen(true);
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApiKey) return;
    try {
      let success = false;
      if (activeApiKey.mode === "change_workspace") {
        success = await keymanagementService.changeWorkspace(
          activeApiKey.id,
          selectedWorkspaceId,
        );
      } else if (activeApiKey.mode === "extend") {
        success = await keymanagementService.extendKeyDuration(
          activeApiKey.id,
          30,
        );
      } else if (activeApiKey.mode === "regenerate") {
        success = await keymanagementService.regenerateKey(activeApiKey.id);
      } else if (activeApiKey.mode === "disable") {
        success = await keymanagementService.disableKey(
          activeApiKey.id,
          !activeApiKey.is_active,
        );
      } else if (activeApiKey.mode === "delete") {
        success = await keymanagementService.deleteKey(activeApiKey.id);
      }

      if (success) {
        await fetchApiKeys();
      }
    } catch (error) {
      console.error(
        `Error executing API key action ${activeApiKey.mode}:`,
        error,
      );
    }
    setApiKeyModalOpen(false);
    setActiveApiKey(null);
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

  const handleDeleteWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkspace) return;
    try {
      const response = await keymanagementService.deleteWorkspace(
        editingWorkspace.id,
      );
      if (response) {
        await fetchWorkspaces();
      }
    } catch (error) {
      console.error("Error deleting workspace:", error);
    }
    setIsEditModalOpen(false);
    setEditingWorkspace(null);
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

      {/* Edit / Delete Workspace Modal */}
      <CommonModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingWorkspace(null);
          setEditWorkspaceName("");
        }}
        title={
          editingWorkspace?.isDelete
            ? "Delete Workspace"
            : "Edit Workspace Name"
        }
        className={
          editingWorkspace?.isDelete ? "max-w-[400px]" : "max-w-[380px]"
        }
      >
        {editingWorkspace?.isDelete ? (
          <form onSubmit={handleDeleteWorkspaceSubmit} className="space-y-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-neutral-900 font-medium">
                Are you sure you want to delete &quot;{editingWorkspace?.name}
                &quot;?
              </p>
              <p className="text-xs font-normal text-red-700">
                This action will permanently delete this workspace, including
                all API keys and users assigned to it. This cannot be undone.
              </p>
            </div>
            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingWorkspace(null);
                }}
                className="w-full py-2 rounded-md font-normal text-sm transition-colors mt-2 bg-[#F5F5F5] hover:bg-neutral-200 text-[#9333EA] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 rounded-md  text-sm font-normal text-[#FEF2F2] mt-2 bg-[#DC2626] rounded-md shadow-xs hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </span>
          </form>
        ) : (
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
        )}
      </CommonModal>

      {/* API Key Action Modals */}
      <CommonModal
        isOpen={ApiKeyModalOpen}
        onClose={() => {
          setApiKeyModalOpen(false);
          setActiveApiKey(null);
        }}
        title={
          activeApiKey?.mode === "change_workspace"
            ? "Change Workspace"
            : activeApiKey?.mode === "extend"
              ? "Extend Expiry Duration?"
              : activeApiKey?.mode === "regenerate"
                ? "Regenerate Key?"
                : activeApiKey?.mode === "disable"
                  ? activeApiKey.is_active
                    ? "Disable Key?"
                    : "Enable Key?"
                  : activeApiKey?.mode === "delete"
                    ? "Delete Key?"
                    : ""
        }
        className="max-w-[380px]"
      >
        {activeApiKey?.mode === "change_workspace" && (
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0A0A0A]">
                Select Workspace
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-between w-full rounded-md border border-[#E5E5E5] px-3 py-2 text-sm bg-white focus-visible:outline-none shadow-xs shadow-[#E5E5E5] cursor-pointer outline-none">
                  <span className="text-[#0A0A0A] text-sm font-normal">
                    {workspaces.find((ws) => ws.id === selectedWorkspaceId)
                      ?.name || "Select a workspace"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#0A0A0A]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--anchor-width)] bg-white border border-[#E5E5E5] rounded-lg shadow-lg z-[100] p-1.5 max-h-60 overflow-y-auto"
                >
                  {workspaces.map((ws) => (
                    <DropdownMenuItem
                      key={ws.id}
                      onClick={() => setSelectedWorkspaceId(ws.id)}
                      className="cursor-pointer px-3 py-2 text-sm text-[#0A0A0A] hover:!bg-neutral-100 data-[focus]:!bg-neutral-100 rounded-md transition-colors flex items-center gap-2"
                    >
                      {ws.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-md font-medium text-sm transition-colors mt-5 bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-[#FAFAFA] shadow-xs cursor-pointer"
            >
              Save
            </button>
          </form>
        )}

        {activeApiKey?.mode === "extend" && (
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-neutral-900 font-medium">
                Are you sure you want to extend the duration of expiry for this
                key for 30 days?
              </p>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setApiKeyModalOpen(false);
                  setActiveApiKey(null);
                }}
                className="w-full py-2 bg-[#F5F5F5] shadow-xs hover:bg-[#E5E5E5] text-[#9333EA] rounded-md font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-[#FAFAFA] rounded-md font-medium text-sm  shadow-xs transition-colors cursor-pointer"
              >
                Extend
              </button>
            </div>
          </form>
        )}

        {activeApiKey?.mode === "regenerate" && (
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-neutral-900 font-medium ">
                Are you sure you want to regenerate a new key?
              </p>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setApiKeyModalOpen(false);
                  setActiveApiKey(null);
                }}
                className="w-full py-2 bg-[#F5F5F5] shadow-xs hover:bg-[#E5E5E5] text-[#9333EA] rounded-md font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-[#FAFAFA] rounded-md font-medium text-sm  shadow-xs transition-colors cursor-pointer"
              >
                Regenerate
              </button>
            </div>
          </form>
        )}

        {activeApiKey?.mode === "disable" && (
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-neutral-900 font-medium">
                {activeApiKey.is_active
                  ? "Are you sure you want to disable this key?"
                  : "Are you sure you want to enable this key?"}
              </p>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setApiKeyModalOpen(false);
                  setActiveApiKey(null);
                }}
                className="w-full py-2 bg-[#F5F5F5] shadow-xs hover:bg-[#E5E5E5] text-[#9333EA] rounded-md font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-[#FAFAFA] rounded-md font-medium text-sm  shadow-xs transition-colors cursor-pointer"
              >
                {activeApiKey.is_active ? "Disable" : "Enable"}
              </button>
            </div>
          </form>
        )}

        {activeApiKey?.mode === "delete" && (
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-neutral-900 font-medium">
                Are you sure you want to delete this API Key?
              </p>
              <p className="text-xs text-red-700 font-medium">
                Existing logs will remain, but this key cannot be used again.
              </p>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setApiKeyModalOpen(false);
                  setActiveApiKey(null);
                }}
                className="w-full py-2 bg-[#F5F5F5] shadow-xs hover:bg-[#E5E5E5] text-[#9333EA] rounded-md font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 bg-[#DC2626] hover:bg-red-700 text-[#FAFAFA] rounded-md shadow-xs font-medium text-sm transition-colors cursor-pointer"
              >
                Delete key
              </button>
            </div>
          </form>
        )}
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
          actions={(row) => [
            {
              label: "Edit",
              onClick: () => handleEditWorkspace(row),
            },
            {
              label: "Delete",
              onClick: () => handleDeleteWorkspace(row),
            },
          ]}
          headerClassName="text-[#737373] text-sm font-medium"
          bodyClassName="text-sm text-[#0A0A0A] font-normal "
          className="border-[#D4D4D4] rounded-md shadow-xs"
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
                  <CopyButton text={row.key_prefix} disabled={!row?.is_active} />
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
          actions={(row) => [
            {
              label: "Change Workspace",
              onClick: () => handleChangeWorkspace(row),
              className: !row.is_active ? "text-[#BDBDBD] cursor-not-allowed" : undefined,
            },
            {
              label: "Extend Duration",
              onClick: () => handleExtendDuration(row),
              className: !row.is_active ? "text-[#BDBDBD] cursor-not-allowed" : undefined,
            },
            {
              label: "Regenerate Key",
              onClick: () => handleRegenerateKey(row),
              className: !row.is_active ? "text-[#BDBDBD] cursor-not-allowed" : undefined,
            },
            {
              label: row.is_active ? "Disable Key" : "Enable Key",
              onClick: () => handleDisableApiKey(row),
            },
            {
              label: "Delete",
              onClick: () => handleDeleteApiKey(row),
            },
          ]}
          headerClassName="text-[#737373] text-sm font-medium"
          bodyClassName="text-sm text-[#0A0A0A] font-normal"
          className="border-[#D4D4D4] rounded-md shadow-xs"
        />
      </div>
    </div>
  );
}
