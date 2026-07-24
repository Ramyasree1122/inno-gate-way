'use client';

import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LogOut, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import SvgIcon from '@/components/svgIcons';
import CheckUsageBalanceComponent from './CheckUsageBalanceComponent';
import ChatComponent from './ChatComponent';
import ChatFooterComponent from './ChatFooterComponent';
import MainChat from './MainChat';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
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
      <aside className="w-64 rounded-sm border border-[#CCCCCC] bg-white flex flex-col m-1 shadow-2xl">
        <div className="h-16 flex items-center px-4 border-b border-[#CCCCCC]">
          <SvgIcon type="radium-ai-icon" width={21} height={23} />
          <span className="text-lg font-semibold pl-1">InnoAIGateway</span>
        </div>
        <CheckUsageBalanceComponent />
        <ChatComponent />
        <ChatFooterComponent />
      </aside>
      <MainChat />
    </div>
  );
}
