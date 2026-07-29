'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from "react";
import { LogOut, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import SvgIcon from "@/components/svgIcons";
import CheckUsageBalanceComponent from "./CheckUsageBalanceComponent";
import ChatComponent from "./ChatComponent";
import ChatFooterComponent from "./ChatFooterComponent";
import MainChat from "./MainChat";
import { chatService } from "@/services/chatService";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasAutoRedirected = useRef(false);
  const [usageResponse, setUsageResponse] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [allowed, setAllowed] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    if (chatSessions && chatSessions.length > 0) {
      if (pathname === "/chat" && !hasAutoRedirected.current) {
        hasAutoRedirected.current = true;
        router.push(`/chat/${chatSessions[0].id}`);
      } else {
        hasAutoRedirected.current = true;
      }
    }
  }, [chatSessions, pathname, router]);
  const fetchData = () => {
    chatService.getCheckUsage().then((response) => {
      setUsageResponse(response);
    });
    chatService.getChatSessions().then((response) => {
      setChatSessions(response);
    });
  };

  useEffect(() => {
    setAllowed(window.localStorage.getItem("allowed") === "true");

    const handleValidationStatus = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (
        customEvent.detail &&
        typeof customEvent.detail.allowed === "boolean"
      ) {
        setAllowed(customEvent.detail.allowed);
      }
    };

    window.addEventListener("gatewayValidationStatus", handleValidationStatus);
    return () => {
      window.removeEventListener(
        "gatewayValidationStatus",
        handleValidationStatus,
      );
    };
  }, []);

  useEffect(() => {
    if (!allowed) return;

    fetchData();
  }, [allowed]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 rounded-sm border border-[#CCCCCC] bg-white flex flex-col m-2 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.16),0_4px_8px_-2px_rgba(0,0,0,0.10)]">
        <div className="h-16 flex items-center px-4 border-b border-[#CCCCCC]">
          <SvgIcon type="radium-ai-icon" width={21} height={23} />
          <span className="text-lg font-semibold pl-1">InnoAIGateway</span>
        </div>
        <CheckUsageBalanceComponent usageResponse={usageResponse} />
        <ChatComponent
          chatSessions={chatSessions}
          setChatMessages={setChatMessages}
        />
        <ChatFooterComponent />
      </aside>
      <MainChat chatMessages={chatMessages} />
    </div>
  );
}

