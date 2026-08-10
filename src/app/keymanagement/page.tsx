"use client";
import React from "react";
import { WorkspaceComponent } from "./components/WorkspaceComponent";
import { ApiKeyComponent } from "./components/ApiKeyComponent";

export default function KeyManagementPage() {
  const [activeTab, setActiveTab] = React.useState<"workspaces" | "apikeys">(
    "workspaces",
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex border-b border-neutral-300 mb-4">
        <button
          onClick={() => setActiveTab("workspaces")}
          className={`py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 outline-none -mb-[1px] me-3 ${
            activeTab === "workspaces"
              ? "text-purple-700  border-purple-700"
              : "text-neutral-700 border-transparent hover:text-neutral-900"
          }`}
        >
          Workspaces
        </button>
        <button
          onClick={() => setActiveTab("apikeys")}
          className={`py-2.5  text-sm font-medium transition-colors cursor-pointer border-b-2 outline-none -mb-[1px] ms-3 ${
            activeTab === "apikeys"
              ? "text-purple-700  border-purple-700"
              : "text-neutral-700 border-transparent hover:text-neutral-900"
          }`}
        >
          API Keys
        </button>
      </div>

      {activeTab === "workspaces" ? (
        <WorkspaceComponent />
      ) : (
        <ApiKeyComponent />
      )}
    </div>
  );
}
