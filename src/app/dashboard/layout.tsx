'use client';

import React from "react";
import Link from "next/link";
import SvgIcon from "@/components/svgIcons";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardFooterComponent from "./components/DashboardFooterComponent";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const getHeaderTitle = () => {
    if (pathname === "/keymanagement") return "Key Management";
    if (pathname === "/dashboard/history") return "History";
    if (pathname === "/dashboard") return "Dashboard";
    return "";
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.05)] border-r border-zinc-200">
        <div className="h-16 flex items-center px-6 border-b border-zinc-100">
          <div className="inline-flex items-center gap-2">
            <SvgIcon type="radium-ai-icon" width={20} height={24} />
            <span className="text-base font-semibold text-zinc-800">
              InnoAIGateway Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${
              pathname === "/dashboard"
                ? "bg-violet-50 text-[var(--color-purple-600)]"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <SvgIcon type="sidebar-dashboard-icon" width={20} height={20} />
            Dashboard
          </Link>

          <Link
            href="/keymanagement"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${
              pathname === "/keymanagement"
                ? "bg-violet-50 text-[var(--color-purple-600)]"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <SvgIcon type="sidebar-key-icon" width={20} height={20} />
            Key Management
          </Link>

          <Link
            href="/dashboard/history"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${
              pathname === "/dashboard/history"
                ? "bg-violet-50 text-[var(--color-purple-600)]"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <SvgIcon type="sidebar-history-icon" width={20} height={20} />
            History
          </Link>
           <Link
            href="/admin-users"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${
              pathname === "/admin-users"
                ? "bg-[#F9F5FF] text-[var(--color-purple-600)]"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <SvgIcon type="sidebar-AdminUsers-icon" width={20} height={20} />
            Admin Users
          </Link>
        </nav>

        <DashboardFooterComponent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-3 bg-white border-b border-zinc-100 shrink-0">
          <h1 className="text-base font-medium text-neutral-950">
            {getHeaderTitle()}
          </h1>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-3">{children}</div>
      </main>
    </div>
  );
}
