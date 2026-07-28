import { ChevronDown, KeyRound, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChatFooterComponent() {
  const { user, logout } = useAuth();

  return (
    <div className="flex rounded-b-sm bg-gray-100">
      <div className="flex w-full items-center justify-between p-3 min-w-0 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-400">
            <span className="text-sm font-semibold text-white">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </span>
          </div>

          <p className="text-xs font-normal text-neutral-900 truncate">
            {user?.email || "johndoe@innogateway.com"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-md p-1 hover:bg-neutral-200 focus:outline-none">
            <ChevronDown size={18} />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="end"
            alignOffset={-10}
            sideOffset={12}
            className="w-[250px] rounded-[10px] border border-[#CCCCCC] shadow-lg bg-[#F0F4F8]"
          >
            <DropdownMenuItem className="flex items-center gap-4  text-black p-3 text-xs font-medium cursor-pointer">
              <KeyRound
                size={20}
                strokeWidth={2}
                className="text-neutral-800"
              />
              Configure API Keys
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={logout}
              className="mt-1 flex items-center gap-4 p-3 text-xs font-medium text-[#EF4444] cursor-pointer"
            >
              <LogOut size={20} strokeWidth={2} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
