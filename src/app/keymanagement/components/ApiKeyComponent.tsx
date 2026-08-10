"use client";
import React, { useEffect } from "react";
import { keymanagementService } from "@/services/keymanagementService";
import { dashboardService } from "@/services/dashboardService";
import { SearchInput } from "@/components/common/SearchInput";
import { CommonTable } from "@/components/common/CommonTable";
import { Copy, ChevronDown, Check } from "lucide-react";
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
import { Workspace } from "./WorkspaceComponent";
import { CommonCalendar } from "@/components/common/CommonCalendar";
import { Model } from "@/app/chat/ChatFooterComponent";

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

export function ApiKeyComponent() {
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [providers, setProviders] = React.useState<Model[]>([]);

  // Modal states
  const [ApiKeyModalOpen, setApiKeyModalOpen] = React.useState(false);
  const [createApiKeyModalOpen, setCreateApiKeyModalOpen] =
    React.useState(false);
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

  const [createForm, setCreateForm] = React.useState({
    workspace_id: "",
    owner: "",
    rate_limit_per_minute: 60,
    expires_at: "",
    access_qwen: false,
    access_anthropic: false,
  });

  const fetchWorkspaces = async () => {
    try {
      const workspaces = await keymanagementService.getAllWorkspaces();
      setWorkspaces(workspaces || []);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await dashboardService.getProviders();
      const data =
        (Array.isArray(response) ? response : (response as any)?.data) || [];
      setProviders(data);
    } catch (error) {
      console.error("Error fetching providers:", error);
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
    fetchApiKeys();
  }, []);

  const isFormValid =
    createForm.workspace_id !== "" &&
    createForm.owner.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.owner.trim()) &&
    createForm.rate_limit_per_minute >= 60 &&
    (createForm.access_qwen || createForm.access_anthropic);

  const handleOpenCreateModal = () => {
    fetchWorkspaces();
    fetchProviders();
    setCreateApiKeyModalOpen(true);
  };

  const handleCreateApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    try {
      const payload = {
        workspace_id: createForm.workspace_id,
        owner: createForm.owner.trim(),
        expires_at: createForm.expires_at ? createForm.expires_at : null,
        rate_limit_per_minute: Number(createForm.rate_limit_per_minute),
        access_qwen: createForm.access_qwen,
        access_anthropic: createForm.access_anthropic,
      };
      await keymanagementService.generateNewAPIKey(payload);
      await fetchApiKeys();
      setCreateForm({
        workspace_id: "",
        owner: "",
        rate_limit_per_minute: 60,
        expires_at: "",
        access_qwen: false,
        access_anthropic: false,
      });
      setCreateApiKeyModalOpen(false);
    } catch (error) {
      console.error("Error creating API key:", error);
    }
  };

  const handleChangeWorkspace = (apiKey: ApiKey) => {
    setActiveApiKey({ ...apiKey, mode: "change_workspace" });
    setSelectedWorkspaceId(apiKey.workspace_id);
    fetchWorkspaces();
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

  return (
    <>
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
              <label className="text-sm font-medium text-neutral-950">
                Select Workspace
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-between w-full rounded-md border border-neutral-200 px-3 py-2 text-sm bg-white focus-visible:outline-none shadow-xs shadow-neutral-200 cursor-pointer outline-none">
                  <span className="text-neutral-950 text-sm font-normal">
                    {workspaces.find((ws) => ws.id === selectedWorkspaceId)
                      ?.name || "Select a workspace"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-neutral-950" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--anchor-width)] bg-white border border-neutral-200 rounded-lg shadow-lg z-[100] p-1.5 max-h-60 overflow-y-auto"
                >
                  {workspaces.map((ws) => (
                    <DropdownMenuItem
                      key={ws.id}
                      onClick={() => setSelectedWorkspaceId(ws.id)}
                      className="cursor-pointer px-3 py-2 text-sm text-neutral-950 hover:!bg-neutral-100 data-[focus]:!bg-neutral-100 rounded-md transition-colors flex items-center gap-2"
                    >
                      {ws.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-md font-medium text-sm transition-colors mt-5 bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-neutral-50 shadow-xs cursor-pointer"
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
                className="w-full py-2 bg-neutral-100 shadow-xs hover:bg-neutral-200 text-purple-600 rounded-md font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-neutral-50 rounded-md font-medium text-sm  shadow-xs transition-colors cursor-pointer"
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
                className="w-full py-2 bg-neutral-100 shadow-xs hover:bg-neutral-200 text-purple-600 rounded-md font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-neutral-50 rounded-md font-medium text-sm  shadow-xs transition-colors cursor-pointer"
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
                className="w-full py-2 bg-neutral-100 shadow-xs hover:bg-neutral-200 text-purple-600 rounded-md font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-neutral-50 rounded-md font-medium text-sm  shadow-xs transition-colors cursor-pointer"
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
                className="w-full py-2 bg-neutral-100 shadow-xs hover:bg-neutral-200 text-purple-600 rounded-md font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-neutral-50 rounded-md shadow-xs font-medium text-sm transition-colors cursor-pointer"
              >
                Delete key
              </button>
            </div>
          </form>
        )}
      </CommonModal>
      {/* Create new API Keys Section */}
      {createApiKeyModalOpen && (
        <CommonModal
          isOpen={createApiKeyModalOpen}
          title="Create API Key"
          onClose={() => setCreateApiKeyModalOpen(false)}
          className="max-w-[425px]"
        >
          <form onSubmit={handleCreateApiKeySubmit} className="space-y-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-950">
                Workspace
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="flex items-center justify-between w-full rounded-md border border-neutral-200 px-3 py-2 text-sm bg-white focus-visible:outline-none shadow-xs shadow-neutral-200 cursor-pointer outline-none placeholder:text-neutral-500 "
                >
                  <span className="text-neutral-950 text-sm font-normal ">
                    {workspaces.find((ws) => ws.id === createForm.workspace_id)
                      ?.name || "Select Workspace"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-neutral-950" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--anchor-width)] bg-white border border-neutral-200 rounded-lg shadow-lg z-[100] p-1.5 max-h-60 overflow-y-auto placeholder:text-neutral-500 "
                >
                  {workspaces.map((ws) => (
                    <DropdownMenuItem
                      key={ws.id}
                      onClick={() =>
                        setCreateForm((prev) => ({
                          ...prev,
                          workspace_id: ws.id,
                        }))
                      }
                      className="cursor-pointer px-3 py-2 text-sm text-neutral-950 hover:!bg-neutral-100 data-[focus]:!bg-neutral-100 rounded-md transition-colors flex items-center gap-2"
                    >
                      {ws.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-950">
                User Email
              </label>
              <input
                type="email"
                placeholder="Enter User Email"
                name="owner"
                value={createForm.owner}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, owner: e.target.value }))
                }
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm bg-white focus-visible:outline-none shadow-xs shadow-neutral-200 outline-none placeholder:text-neutral-500 "
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-950">
                Rate limit per minute
              </label>
              <input
                type="number"
                name="rate_limit_per_minute"
                placeholder="Enter rate limit"
                value={createForm.rate_limit_per_minute}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    rate_limit_per_minute: Math.max(60, Number(e.target.value)),
                  }))
                }
                min={60}
                className="w-full rounded-md  text-neutral-950 border border-neutral-200 px-3 py-2 text-sm bg-white focus-visible:outline-none shadow-xs shadow-neutral-200 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-950">
                Expiration date and time
              </label>
              <CommonCalendar
                value={
                  createForm.expires_at ? new Date(createForm.expires_at) : null
                }
                onChange={(val) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    expires_at: val ? val.toISOString() : "",
                  }))
                }
                placeholder="dd/mm/yyyy , --:-- --"
                inputClassName="rounded-md py-2 shadow-xs placeholder:text-neutral-500"
              />

            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-neutral-950">
                Provider access
              </label>
              <div className="space-y-2 mt-1">                 {providers.map((provider) => {
                  const isChecked =
                    provider.id === "qwen"
                      ? createForm.access_qwen
                      : provider.id === "anthropic"
                        ? createForm.access_anthropic
                        : false;
                  return (
                    <div key={provider.id} className="flex items-center gap-3 py-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (provider.id === "qwen") {
                              setCreateForm((prev) => ({
                                ...prev,
                                access_qwen: e.target.checked,
                              }));
                            } else if (provider.id === "anthropic") {
                              setCreateForm((prev) => ({
                                ...prev,
                                access_anthropic: e.target.checked,
                              }));
                            }
                          }}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-all duration-200 shadow-sm
                            ${
                            isChecked
                              ? "bg-neutral-900 border-neutral-900 text-white"
                              : "bg-white border-neutral-300 hover:border-neutral-400"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-sm text-neutral-900 font-normal">
                          {provider.name}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-2 rounded-md font-medium text-sm transition-colors mt-5 shadow-xs text-neutral-50 ${
                isFormValid
                  ? "bg-[linear-gradient(90deg,var(--color-brand-purple)_0%,var(--color-brand-blue)_100%)] cursor-pointer"
                  : "bg-neutral-900 opacity-50 cursor-not-allowed"
              }`}
            >
              Create API Key
            </button>
          </form>
        </CommonModal>
      )}

      {/* API Keys Section */}
      <div className="bg-white rounded-lg p-3">
        {/* <h3 className="text-xl font-semibold text-neutral-900 mb-4">
          API keys
        </h3> */}
        <div className="flex justify-between items-center w-full mb-4">
          <div className="w-72">
            <SearchInput
              placeholder="Search workspaces,users and API keys..."
              className="text-xs font-normal text-[#737373]"
              containerClassName="rounded-md border-neutral-200 shadow-xs"
            />
          </div>
          <button
            className="bg-neutral-100 hover:bg-neutral-200 text-purple-600 text-sm font-medium px-3 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
            onClick={handleOpenCreateModal}
          >
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
                  <CopyButton
                    text={row.key_prefix}
                    disabled={!row?.is_active}
                  />
                </div>
              ),
            },
            {
              key: "is_active",
              title: "Status",
              render: (row) =>
                row.is_active ? (
                  <span className="bg-green-200 text-green-800  px-2 py-0.5 rounded-md text-xs font-medium  shadow-sm">
                    Enabled
                  </span>
                ) : (
                  <span className="bg-neutral-100 text-neutral-900 border-white px-2 py-0.5 rounded-md text-xs font-medium">
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
              onClick: () => row.is_active && handleChangeWorkspace(row),
              className: !row.is_active
                ? "text-[#BDBDBD] cursor-not-allowed pointer-events-none hover:!bg-transparent focus:!bg-transparent data-[focus]:!bg-transparent"
                : undefined,
            },
            {
              label: "Extend Duration",
              onClick: () => row.is_active && handleExtendDuration(row),
              className: !row.is_active
                ? "text-[#BDBDBD] cursor-not-allowed pointer-events-none hover:!bg-transparent focus:!bg-transparent data-[focus]:!bg-transparent"
                : undefined,
            },
            {
              label: "Regenerate Key",
              onClick: () => row.is_active && handleRegenerateKey(row),
              className: !row.is_active
                ? "text-[#BDBDBD] cursor-not-allowed pointer-events-none hover:!bg-transparent focus:!bg-transparent data-[focus]:!bg-transparent"
                : undefined,
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
          bodyClassName="text-sm text-neutral-950 font-normal"
          className="border-[#D4D4D4] rounded-md shadow-xs"
        />
      </div>
    </>
  );
}
