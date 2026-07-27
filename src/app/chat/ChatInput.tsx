"use client";
import { useState, useRef } from "react";
import { ArrowUp, Plus, X, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const models = [
  {
    value: "Qwen Coder 30B",
    label: "Qwen Coder 30B",
  },
  {
    value: "Llama 3.3",
    label: "Llama 3.3",
  },
  {
    value: "GPT-4.1",
    label: "GPT-4.1",
  },
];

interface Attachment {
  id: string;
  name: string;
  type: "image" | "spreadsheet" | "document" | "text" | "other";
  size: number;
  previewUrl?: string;
  file: File;
}

type ChatInputProps = {
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  message: string;
  handleSendMessage?: (message: string) => void;
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
    (message ?? "").trim().length === 0 && attachments.length === 0;

  const handleSend = () => {
    if (isSendDisabled) return;
    handleSendMessage?.(message);
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
        className={`flex flex-col rounded-[20px] border border-neutral-200 bg-white p-3 px-3 cursor-default w-[50%] max-w-[1100px]
          
          ${
            isWelcome
              ? "mt-4 shadow-[0px_25px_20px_-20px_rgba(0,0,0,0.40)] transition-all duration-200 hover:border-neutral-300 hover:shadow-[0px_26px_22px_-20px_rgba(0,0,0,0.42)]"
              : "shadow-none hover:border-neutral-300"
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
              placeholder="Ask anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[40px] w-full resize-none border-0 p-0 text-base shadow-none outline-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-[#767586] bg-transparent"
            />

            <div className="mt-3 flex items-center gap-2">
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={handleUploadClick}
                  className="h-8 w-10 rounded-md bg-neutral-100 text-black border-0 shadow-none cursor-pointer"
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

              <Select defaultValue={models[0].value}>
                <SelectTrigger className="h-8 w-[150px] cursor-pointer gap-1 rounded-md border-0 bg-neutral-100 px-3 text-xs font-normal text-black shadow-none hover:bg-neutral-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="bottom" sideOffset={6} align="start">
                  {models.map((model) => (
                    <SelectItem
                      key={model.value}
                      value={model.value}
                      className="text-sm font-normal text-[#0A0A0A]"
                    >
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
