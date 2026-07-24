"use client";
import { useState } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";

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

export default function ChatInput() {
  const [message, setMessage] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const pathname = usePathname();
  const isChatConversation = pathname !== "/chat";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files?.length) return;

    console.log(files); // Handle uploaded files here
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    console.log(message);
    setShowResponse(true);
  };

  return (
    <div
      className={`flex items-start rounded-[20px] border border-neutral-200 bg-white p-3 pl-5 pr-4 cursor-pointer
 ${
   isChatConversation
     ? "fixed bottom-9 left-[calc(50%+148px)] -translate-x-1/2 shadow-none hover:border-neutral-300"
     : "mt-4 shadow-[0px_25px_20px_-20px_rgba(0,0,0,0.40)] transition-all duration-200 hover:border-neutral-300 hover:shadow-[0px_26px_22px_-20px_rgba(0,0,0,0.42)]"
 }`}
    >

      <div className="flex-1 flex flex-col">
        {/* Message Input */}
        <Textarea
          placeholder="Ask anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[40px] w-xl resize-none border-0 p-0 text-base shadow-none outline-none focus-visible:ring-0 focus-visible:border-0 placeholder:text-[#767586] bg-transparent"
        />

        {/* Bottom Toolbar */}
        <div className="mt-3 flex items-center gap-2">
          {/* Plus Button */}
          {/* <Button
            variant="secondary"
            size="icon"
            className="h-8 w-10 rounded-md bg-neutral-100 text-black border-0 shadow-none cursor-pointer"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />{" "}
          </Button> */}
          <>
            <Button
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
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg"
            />
          </>

          {/* Model Selector */}
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

      {/* Send Button */}
      <Button
        size="icon"
        disabled={message.length === 0}
        onClick={handleSendMessage}
        className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
          message.length > 0
            ? "bg-[linear-gradient(90deg,#AC6AEE_0%,#3D30F4_100%)] text-white hover:opacity-90 cursor-pointer border-0"
            : "bg-[#F5F5F5] text-[##BDBDBD]"
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}
