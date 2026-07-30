"use client";

import SvgIcon from "@/components/svgIcons";
import ChatInput from "./ChatInput";
import ChatConversation from "./ChatConversation";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { chatService } from "@/services/chatService";

interface Message {
  id: string;
  role: string;
  content: string;
  model?: string | null;
  provider?: string | null;
}

interface ChatMessages {
  id: string;
  title: string;
  messages: Message[];
}

interface props {
  chatMessages: ChatMessages | null;
}

export default function MainChat({ chatMessages }: props) {
  const pathname = usePathname();
  const router = useRouter();
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isWelcome = pathname === "/chat" || pathname === "/chat/";
  const chatId = pathname.startsWith("/chat/") && pathname.length > 6 ? pathname.substring(6) : null;

  // Clear input message when switching chats
  useEffect(() => {
    setMessageText("");
  }, [chatId]);

  // Load chat messages based on chatId
  useEffect(() => {
    if (chatId) {
      if (chatMessages && chatMessages.id === chatId) {
        setLocalMessages(chatMessages.messages || []);
      } else {
        chatService.getChatById(chatId).then((response) => {
          if (response) {
            setLocalMessages(response.messages || []);
          }
        });
      }
    } else {
      setLocalMessages([]);
    }
  }, [chatId, chatMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, chatId]);

  const handleSendMessage = async (text: string, selectedModel?: any) => {
    if (!text.trim()) return;

    let activeChatId = chatId;
    
    if (!activeChatId) {
      try {
        const response = await chatService.createChatSession({});
        if (response && response.id) {
          activeChatId = response.id;
          router.push(`/chat/${activeChatId}`);
        } else {
          return;
        }
      } catch (err) {
        console.error("Failed to create new session", err);
        return;
      }
    }

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: text,
      model: null,
      provider: null,
    };

    const updatedMessages = [...localMessages, userMsg];
    setLocalMessages(updatedMessages);
    setIsGenerating(true);

    try {
      const payload = {
        provider: selectedModel?.provider || "anthropic",
        model: selectedModel?.value || "claude-sonnet-4-6",
        session_id: activeChatId,
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
      };

      const response = await chatService.sendChatCompletion(payload);

      const aiContent =
        response?.choices?.[0]?.message?.content ||
        response?.content ||
        response?.message?.content ||
        "Sorry, I did not understand that.";

      const aiMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: aiContent,
        model: selectedModel?.value || "claude-sonnet-4-6",
        provider: selectedModel?.provider || "anthropic",
      };

      setLocalMessages((prev) => [...prev, aiMsg]);
      window.dispatchEvent(new CustomEvent("refreshChatData"));
    } catch (error) {
      console.error("Failed to get chat completion", error);
      const errorMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: "Request failed: Internal Server Error",
        model: null,
        provider: null,
      };
      setLocalMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isWelcome) {
    return (
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden justify-center items-center bg-white p-4">
        <div className="flex flex-col items-center mb-6">
          <SvgIcon type="radium-ai-icon" width={53} height={60} />
          <h1 className="text-2xl font-normal text-black mt-2 select-none">
            <span className="text-gray-500 font-light">Welcome to</span>{" "}
            <span className="font-semibold">InnoAIGateway</span>
          </h1>
        </div>
        <div className="w-full flex justify-center">
          <ChatInput
            message={messageText}
            setMessage={setMessageText}
            handleSendMessage={handleSendMessage}
            isWelcome={true}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white h-screen relative">
      {/* Scrollable conversation area */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="w-full flex justify-center">
          {localMessages.length > 0 && (
            <ChatConversation messages={localMessages} isGenerating={isGenerating} />
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input fixed at the bottom */}
      <div className="w-full flex justify-center pb-6 bg-white pt-4 px-4">
        <ChatInput
          message={messageText}
          setMessage={setMessageText}
          handleSendMessage={handleSendMessage}
          isWelcome={false}
        />
      </div>
    </main>
  );
}
