import { ChevronDown } from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';

export default function ChatFooterComponent() {
      const { user,logout } = useAuth();
    return (
      <div className="flex bg-gray-100 rounded-b-sm">
        <div className="flex w-full items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-400">
              <span className="text-sm font-semibold text-white">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <p className="text-xs font-normal text-neutral-900">
              {user?.email || "johndoe@innogateway.com"}
            </p>
          </div>
          <ChevronDown
            size={18}
            strokeWidth={1.8}
            className="text-neutral-900 cursor-pointer"
          />
        </div>
      </div>
    );
}