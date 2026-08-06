"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { authService } from "@/services/authService";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardFooterComponent() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      // The authService handles the API call and the redirect
      await authService.logoutUser("/admin/login");
      // Wait, since admin login is at /admin/login, we might need to overwrite the location here 
      // if logoutUser routes to /login.
      // But authService.logoutUser directly changes window.location.href.
      // Let's just call it.
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex w-full items-center justify-between p-4 border-t border-zinc-100 mt-auto shrink-0 hover:bg-zinc-50 transition-colors focus:outline-none">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-400">
                <span className="text-sm font-semibold text-white">
                  {user?.email?.[0]?.toUpperCase() || "A"}
                </span>
              </div>

              <p className="text-xs font-medium text-neutral-900 truncate">
                {user?.email || "admin@innogateway.com"}
              </p>
            </div>
            <ChevronDown size={18} className="text-zinc-600" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="center"
          sideOffset={8}
          className="w-[240px] rounded-[10px] border-none shadow-lg bg-[var(--color-gray-100)]"
        >
          <DropdownMenuItem
            onClick={handleLogout}
            className="group flex items-center gap-4 p-3 text-xs font-medium !text-[#EF4444] hover:!text-[#EF4444] cursor-pointer"
          >
            <LogOut
              size={20}
              strokeWidth={2}
              stroke="#EF4444"
              className="!text-[#EF4444] group-hover:!text-[#EF4444]"
              style={{ color: "#EF4444" }}
            />
            <span style={{ color: "#EF4444" }}>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
