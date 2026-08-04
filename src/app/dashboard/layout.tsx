'use client';

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen flex bg-zinc-50 overflow-hidden text-sm">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.05)] border-r border-zinc-200">
        <div className="h-16 flex items-center px-6 border-b border-zinc-100">
          <span className="text-base font-semibold pl-2 text-zinc-800">InnoAIGateway Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center px-3 py-2.5 bg-[#F9F5FF] text-[var(--color-brand-purple)] rounded-md font-medium">
            Dashboard
          </Link>
          
          <Link href="/dashboard/keys" className="flex items-center px-3 py-2.5 text-zinc-600 hover:bg-zinc-50 rounded-md font-medium transition-colors">
            Key Management
          </Link>

          <Link href="/dashboard/history" className="flex items-center px-3 py-2.5 text-zinc-600 hover:bg-zinc-50 rounded-md font-medium transition-colors">
            History
          </Link>

          <Link href="/dashboard/usage" className="flex items-center px-3 py-2.5 text-zinc-600 hover:bg-zinc-50 rounded-md font-medium transition-colors">
            Cost / Usage
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button onClick={logout} className="flex w-full items-center px-3 py-2.5 text-zinc-600 hover:bg-zinc-50 rounded-md font-medium transition-colors">
            Logout
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-zinc-100 shrink-0">
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
