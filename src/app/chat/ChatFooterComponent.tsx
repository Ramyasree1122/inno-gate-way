"use client";

import { useState, useEffect } from "react";
import { ChevronDown, KeyRound, LogOut, X, Check } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { get } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { chatService } from "@/services/chatService";

interface Model {
  id: string;
  display_name?: string;
}

interface Provider {
  id?: string;
  name?: string;
  models?: Model[];
}

interface ValidateResponse {
  allowed?: boolean;
  reason?: string;
}

export default function ChatFooterComponent() {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [providers, setProviders] = useState<
    { id: string; name: string; providerId?: string }[]
  >([]);
  const [selectedProvider, setSelectedProvider] = useState("");

  useEffect(() => {
    if (isModalOpen) {
      const fetchProviders = async () => {
        try {
          const response = (await get(API_ENDPOINTS.AUTH.PROVIDERS)) as { data?: Provider[] } | Provider[] | null;
          const data = (Array.isArray(response) ? response : response?.data) || [];

          const formattedProviders: {
            id: string;
            name: string;
            providerId?: string;
          }[] = [];
          data.forEach((provider: Provider) => {
            if (provider.models && provider.models.length > 0) {
              provider.models.forEach((model: Model) => {
                formattedProviders.push({
                  id: model.id,
                  name: model.display_name || model.id,
                  providerId: provider.id,
                });
              });
            } else {
              formattedProviders.push({
                id: provider.id || "",
                name: provider.name || "",
                providerId: provider.id,
              });
            }
          });

          setProviders(formattedProviders);
        } catch (error) {
          console.error("Failed to fetch providers", error);
        }
      };
      fetchProviders();
    }
  }, [isModalOpen]);

  const handleValidate = async () => {
    if (!selectedProvider || !apiKey) return;

    const selectedObj = providers.find(
      (p) => (p.id || p.name) === selectedProvider,
    );
    const providerToValidate = selectedObj?.providerId || selectedProvider;

    try {
      const response = (await get(
        API_ENDPOINTS.AUTH.VALIDATE(providerToValidate),
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        },
      )) as ValidateResponse | null;
      if (response?.allowed) {
        window.localStorage.setItem("AI_ID", apiKey);
        window.localStorage.setItem("allowed", "true");
        // Fetch authenticated user information
        const userInfo = await chatService.getUserInfo();
        if (userInfo?.owner_user_id) {
          window.localStorage.setItem("USER_ID", userInfo?.owner_user_id);
        } else {
          console.error("owner_user_id not found", userInfo);
        }
        window.dispatchEvent(
          new CustomEvent("gatewayValidationStatus", {
            detail: { allowed: true },
          }),
        );
        setIsModalOpen(false);
      } else {
        window.localStorage.setItem("allowed", "false");
        window.dispatchEvent(
          new CustomEvent("gatewayValidationStatus", {
            detail: { allowed: false },
          }),
        );
        alert("Validation failed: " + (response?.reason || "Unknown reason"));
      }
    } catch (error) {
      console.error("Validation failed", error);
      window.localStorage.setItem("allowed", "false");
      window.dispatchEvent(
        new CustomEvent("gatewayValidationStatus", {
          detail: { allowed: false },
        }),
      );
      alert("Validation failed. Please check the console for details.");
    }
  };

  return (
    <>
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
              <DropdownMenuItem
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-4 text-black p-3 text-xs font-medium cursor-pointer"
              >
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

      {/* Gateway API Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="w-[400px] rounded-xl bg-white p-6 shadow-2xl relative flex flex-col">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-neutral-600 hover:text-black transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            <h2 className="text-[13px] font-semibold text-neutral-900 mb-4">
              Gateway API Key
            </h2>

            <div className="mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  className="flex h-9 w-[352px] cursor-pointer items-center justify-between gap-1 rounded-[4px] border border-[#E5E7EB] bg-white px-3 text-[13px] font-normal text-black shadow-none outline-none transition-colors hover:border-neutral-300"
                >
                  <span className="truncate">
                    {providers.find(
                      (p) => (p.id || p.name) === selectedProvider,
                    )?.name ||
                      providers.find(
                        (p) => (p.id || p.name) === selectedProvider,
                      )?.id ||
                      "Select Provider"}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 text-neutral-400"
                    strokeWidth={2}
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  className="w-[352px] rounded-md border border-neutral-200 bg-white p-1 shadow-lg"
                >
                  {providers.length > 0 ? (
                    providers.map((provider) => {
                      const value = provider.id || provider.name;
                      const label = provider.name || provider.id;
                      return (
                        <DropdownMenuItem
                          key={value}
                          onClick={() => setSelectedProvider(value)}
                          className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-2 text-[13px] font-normal text-black hover:bg-neutral-100 focus:bg-neutral-100"
                        >
                          <span>{label}</span>

                          {selectedProvider === value && (
                            <Check
                              className="h-4 w-4 text-[#AC6AEE]"
                              strokeWidth={2}
                            />
                          )}
                        </DropdownMenuItem>
                      );
                    })
                  ) : (
                    <DropdownMenuItem
                      disabled
                      className="px-2 py-2 text-[13px] text-neutral-400"
                    >
                      Loading providers...
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <input
              type="text"
              placeholder="Please Enter API Keys"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-[4px] border border-[#E5E7EB] px-3 py-[6px] text-[13px] placeholder:text-neutral-400 outline-none focus:border-[var(--color-brand-purple)] focus:ring-1 focus:ring-[var(--color-brand-purple)] mb-5"
            />

            <button
              onClick={handleValidate}
              className="self-start rounded-[6px] bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] px-8 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
            >
              Validate
            </button>
          </div>
        </div>
      )}
    </>
  );
}
