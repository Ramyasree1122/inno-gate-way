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
      <div className="p-4 border-t border-zinc-100 mt-auto shrink-0">
        <div className="flex w-full items-center justify-between min-w-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)]">
              <span className="text-sm font-semibold text-white">
                {user?.email?.[0]?.toUpperCase() || "A"}
              </span>
            </div>

            <p className="text-xs font-medium text-neutral-900 truncate">
              {user?.email || "admin@innogateway.com"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-md p-1 focus:outline-none hover:bg-zinc-100 transition-colors">
              <ChevronDown size={18} className="text-zinc-600" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="top"
              align="end"
              alignOffset={-10}
              sideOffset={12}
              className="w-[250px] rounded-[10px] border border-[#CCCCCC] shadow-lg bg-[#F0F4F8]"
            >
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-4 p-3 text-xs font-medium !text-[#EF4444] cursor-pointer"
              >
                <LogOut size={20} strokeWidth={2} className="!text-[#EF4444]" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

    </>
  );
}
