"use client";
import { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Plus,
  X,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get } from "@/lib/axios";
import { API_ENDPOINTS } from "@/shared/constants/apiEndpoints";


interface Attachment {
  id: string;
  name: string;
  type: "image" | "spreadsheet" | "document" | "text" | "other";
  size: number;
  previewUrl?: string;
  file: File;
}
interface Model {
  id: string;
  display_name?: string;
}

interface Provider {
  id?: string;
  name?: string;
  models?: Model[];
}

interface ProviderResponse {
  data?: Provider[];
}
type ChatInputProps = {
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  message: string;
  handleSendMessage?: (
    message: string,
    modelInfo?: { value: string; label: string; provider?: string } | null,
  ) => void;
  isWelcome?: boolean;
};

export default function ChatInput({
  setMessage = () => {},
  message,
  handleSendMessage,
  isWelcome = true,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [models, setModels] = useState<
    { value: string; label: string; provider?: string }[]
  >([]);
  const [selectedModel, setSelectedModel] = useState<{
    value: string;
    label: string;
    provider?: string;
  } | null>(null);

  const [isAllowed, setIsAllowed] = useState(false);
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = (await get(API_ENDPOINTS.AUTH.PROVIDERS)) as
          | Provider[]
          | ProviderResponse
          | null;
        const data =
          (Array.isArray(response) ? response : response?.data) || [];
        const formattedModels: {
          value: string;
          label: string;
          provider?: string;
        }[] = [];
        data.forEach((provider: Provider) => {
          if (provider.models && provider.models.length > 0) {
            provider.models.forEach((model: Model) => {
              formattedModels.push({
                value: model.id,
                label: model.display_name || model.id,
                provider: provider.id || provider.name,
              });
            });
          } else {
            formattedModels.push({
              value: provider.id || provider.name || "",
              label: provider.name || provider.id || "",
              provider: provider.id || provider.name,
            });
          }
        });
        setModels(formattedModels);
        const storedModelId = window.localStorage.getItem("SELECTED_MODEL");
        if (storedModelId) {
          const found = formattedModels.find((m) => m.value === storedModelId);
          if (found) {
            setSelectedModel(found);
          } else if (formattedModels.length > 0) {
            setSelectedModel(formattedModels[0]);
          }
        } else if (formattedModels.length > 0) {
          setSelectedModel(formattedModels[0]);
        }
      } catch (error) {
        console.error("Failed to fetch models", error);
      }
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    const isAllowedInitially = typeof window !== "undefined" && window.localStorage.getItem("allowed") === "true";
    if (isAllowedInitially) {
      Promise.resolve().then(() => {
        setIsAllowed(true);
      });
    }

    const handleStatusChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ allowed?: boolean }>;
      setIsAllowed(!!customEvent.detail?.allowed);
      const storedModelId =
        typeof window !== "undefined"
          ? window.localStorage.getItem("SELECTED_MODEL")
          : null;
      if (storedModelId) {
        setModels((currentModels) => {
          const found = currentModels.find((m) => m.value === storedModelId);
          if (found) {
            setSelectedModel(found);
          }
          return currentModels;
        });
      }
    };
    window.addEventListener("gatewayValidationStatus", handleStatusChange);
    return () =>
      window.removeEventListener("gatewayValidationStatus", handleStatusChange);
  }, []);

  useEffect(() => {
    return () => {
      attachments.forEach((att) => {
        if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
      });
    };
  }, [attachments]);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files?.length) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => {
      const id = Math.random().toString(36).substring(2, 9);
      let type: "image" | "spreadsheet" | "document" | "text" | "other" =
        "document";

      if (file.type.startsWith("image/")) {
        type = "image";
      } else if (
        file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".csv")
      ) {
        type = "spreadsheet";
      } else if (file.type.startsWith("text/") || file.name.endsWith(".txt")) {
        type = "text";
      }

      let previewUrl: string | undefined = undefined;
      if (type === "image") {
        previewUrl = URL.createObjectURL(file);
      }

      return {
        id,
        name: file.name,
        type,
        size: file.size,
        previewUrl,
        file,
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);

    if (e.target) {
      e.target.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const isSendDisabled =
    !isAllowed ||
    ((message ?? "").trim().length === 0 && attachments.length === 0);

  const handleSend = () => {
    if (isSendDisabled) return;
    handleSendMessage?.(message, selectedModel);
    setMessage("");
    attachments.forEach((att) => {
      if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
    });
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full flex flex-col items-center relative">
      <div
        className={`flex flex-col rounded-[20px] border border-neutral-200 bg-white p-3 px-3 cursor-default w-[55%] max-w-[1100px]
          
          ${
            isWelcome
              ? "mt-4 shadow-[0px_25px_20px_-20px_rgba(0,0,0,0.40)] transition-all duration-200 hover:border-neutral-300 hover:shadow-[0px_26px_22px_-20px_rgba(0,0,0,0.42)]"
              : // : "shadow-lg hover:border-neutral-300"
                // "shadow-[0_10px_20px_rgba(0,0,0,0.05)] hover:border-neutral-300"
                // "shadow-[0_10px_25px_rgba(0,0,0,0.08)] hover:border-neutral-300"
                "shadow-[0_10px_25px_rgba(0,0,0,0.1)] hover:border-neutral-300"
            // "shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08),0_4px_6px_-4px_rgba(0,0,0,0.05)] hover:border-neutral-300"
          }`}
      >
        {attachments.length > 0 && (
          <div className="flex flex-row gap-3 overflow-x-auto pb-3 pt-1 max-w-full scrollbar-none cursor-pointer">
            {" "}
            {attachments.map((att) => {
              if (att.type === "image" && att.previewUrl) {
                return (
                  <div key={att.id} className="relative flex-shrink-0 group">
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      className="w-11 h-11 object-cover rounded-lg border border-neutral-200"
                    />
                    <button
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="absolute -top-1.5 -right-1.5 bg-black hover:bg-neutral-800 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-md cursor-pointer transition-colors border border-white"
                    >
                      <X className="h-3 w-3" strokeWidth={2.5} />
                    </button>
                  </div>
                );
              }

              const isSpreadsheet = att.type === "spreadsheet";
              const iconBg = isSpreadsheet ? "bg-emerald-500" : "bg-blue-500";
              const displayType = isSpreadsheet ? "Spreadsheet" : "Document";
              const Icon = isSpreadsheet ? FileSpreadsheet : FileText;

              return (
                <div
                  key={att.id}
                  className="relative flex-shrink-0 flex items-center gap-2 p-1.5 rounded-lg bg-white hover:bg-[#F5F5F5] border border-[#D2D2D2] min-w-[150px] max-w-[200px]"
                >
                  <div
                    className={`${iconBg} text-white rounded-lg p-1.5 flex items-center justify-center w-8 h-8`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-neutral-800 truncate select-none">
                      {att.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-normal select-none">
                      {displayType}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="absolute -top-1.5 -right-1.5 bg-black hover:bg-neutral-800 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center shadow-md cursor-pointer transition-colors border border-white"
                  >
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-start">
          <div className="flex-1 flex flex-col">
            <Textarea
              placeholder={
                isAllowed ? "Ask anything..." : "API key required..."
              }
              value={message}
              disabled={!isAllowed}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[40px] w-full resize-none border-0 p-0 text-base shadow-none outline-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-[#767586] bg-transparent disabled:bg-transparent disabled:opacity-50"
            />

            <div className="mt-3 flex items-center gap-2">
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  disabled={!isAllowed}
                  onClick={handleUploadClick}
                  className="h-8 w-10 rounded-md bg-neutral-100 text-black border-0 shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg,.xls,.xlsx,.mp3,.mp4,.avi,.mov,.zip,.rar"
                />
              </>

              <DropdownMenu>
                <DropdownMenuTrigger
                  type="button"
                  disabled={!isAllowed}
                  className="flex h-8 w-[150px] items-center justify-between gap-1 rounded-md border-0 bg-neutral-100 px-3 text-xs font-normal text-black shadow-none outline-none transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="truncate">
                    {selectedModel?.label || "Loading..."}
                  </span>
                  <ChevronDown className="h-4 w-4" strokeWidth={2} />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  sideOffset={6}
                  className="w-[150px] rounded-md border border-neutral-200 bg-white p-1 shadow-lg"
                >
                  {models.length > 0 ? (
                    models.map((model) => (
                      <DropdownMenuItem
                        key={model.value}
                        onClick={() => setSelectedModel(model)}
                        className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-2 text-sm font-normal text-black focus:bg-neutral-100"
                      >
                        <span>{model.label}</span>

                        {selectedModel?.value === model.value && (
                          <Check
                            className="h-4 w-4 text-primary"
                            strokeWidth={2}
                          />
                        )}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem
                      disabled
                      className="px-2 py-2 text-sm text-neutral-400"
                    >
                      Loading...
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Button
            size="icon"
            disabled={isSendDisabled}
            onClick={handleSend}
            className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors self-start ml-2 ${
              !isSendDisabled
                ? "bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-white hover:opacity-90 cursor-pointer border-0"
                : "bg-[#F5F5F5] text-[#BDBDBD]"
            }`}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
