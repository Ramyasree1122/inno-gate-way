"use client";
import React, { useEffect } from "react";
import { keymanagementService } from "@/services/keymanagementService";
import { SearchInput } from "@/components/common/SearchInput";
import { CommonTable } from "@/components/common/CommonTable";
import { CommonModal } from "@/components/common/CommonModal";

export interface Workspace {
  id: string;
  name: string;
  created_by?: string;
  created_at?: string;
  isDelete?: boolean;
}

export function WorkspaceComponent() {
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);

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

  useEffect(() => {
    fetchWorkspaces();
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
    <>
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
            <label className="text-sm font-medium text-neutral-950">
              Workspace name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter a workspace name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              className="flex w-full rounded-md border border-neutral-200 px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none shadow-xs shadow-neutral-200"
            />
          </div>
          <button
            type="submit"
            disabled={!newWorkspaceName.trim()}
            className={`w-full py-2 rounded-md font-medium text-sm transition-colors mt-2 ${
              newWorkspaceName.trim()
                ? "bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-white cursor-pointer"
                : "bg-neutral-900 text-white cursor-not-allowed opacity-50"
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
                className="w-full py-2 rounded-md font-normal text-sm transition-colors mt-2 bg-neutral-100 hover:bg-neutral-200 text-purple-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full py-2 rounded-md  text-sm font-normal text-red-50 mt-2 bg-red-600 rounded-md shadow-xs hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </span>
          </form>
        ) : (
          <form onSubmit={handleEditWorkspaceSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-950">
                Workspace name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter a workspace name"
                value={editWorkspaceName}
                onChange={(e) => setEditWorkspaceName(e.target.value)}
                className="flex w-full rounded-md border border-neutral-200 px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none shadow-xs shadow-neutral-200"
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

      {/* Workspaces Section */}
      <div className="bg-white rounded-lg p-3 mb-2">
        {/* <h2 className="text-neutral-900 text-xl font-semibold mb-4">
          Workspaces
        </h2> */}
        <div className="flex justify-between items-center w-full mb-4">
          <div className="w-72">
            <SearchInput
              placeholder="Search workspaces..."
              className="text-xs font-normal text-neutral-500"
              containerClassName="rounded-md border border-neutral-200 shadow-xs"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-neutral-100 hover:bg-neutral-200 text-purple-600 text-sm font-medium px-3 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            Create Workspace
          </button>
        </div>

        <CommonTable
          data={workspaces?.items}
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
          headerClassName="text-neutral-500 text-sm font-medium"
          bodyClassName="text-sm text-neutral-950 font-normal "
          className="border-neutral-300 rounded-md shadow-xs"
        />
      </div>
    </>
  );
}
