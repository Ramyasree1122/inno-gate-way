"use client";

import SvgIcon from "@/components/svgIcons";
import ChatInput from "./ChatInput";
import ChatConversation from "./ChatConversation";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function MainChat() {
  const pathname = usePathname();
  const [messageText, setMessageText] = useState("");

  // Track messages per chatId
  const [sessions, setSessions] = useState<Record<string, Message[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current chatId from pathname (e.g. /chat/123 -> 123)
  const isWelcome = pathname === "/chat";
  const chatId = pathname.startsWith("/chat/") ? pathname.substring(6) : null;

  // Clear input message when switching chats
  useEffect(() => {
    setMessageText("");
  }, [chatId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, chatId]);

  const currentMessages = chatId ? sessions[chatId] || [] : [];

  const handleSendMessage = (text: string) => {
    if (!chatId || !text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: text,
    };

    // Update session messages with user message
    setSessions((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), userMsg],
    }));

    // Mock AI response after a short delay
    setTimeout(() => {
      const aiMsg: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: `## Response to your request

You asked:

> **${text}**

Here's a simple JavaScript example:

\`\`\`javascript
async function fetchUsers() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const users = await response.json();

    console.log(users);
  } catch (error) {
    console.error("Something went wrong:", error);
  }
}

fetchUsers();
\`\`\`

### What this code does

- Fetches data from an API.
- Converts the response to JSON.
- Prints the data to the console.
- Handles errors using \`try...catch\`.

If you'd like, I can also provide the same example in **Python**, **TypeScript**, **React**, or **Next.js**.`,
      };

      setSessions((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), aiMsg],
      }));
    }, 800);
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
        {currentMessages.length > 0 && (
          <ChatConversation messages={currentMessages} />
        )}
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
