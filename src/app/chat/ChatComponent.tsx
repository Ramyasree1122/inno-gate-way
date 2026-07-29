import Link from "next/link";
import { SquarePen } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { chatService } from "@/services/chatService";
type Chat = {
  id: string;
  title: string;
};
interface props {
  chatSessions: ChatSession[];
}
export interface ChatSession {
  id: string;
  title: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}
export default function ChatComponent({ chatSessions }: props) {
  const router = useRouter();

  const pathname = usePathname();

  const handleNewChat = async () => {
    try {
      const response = await chatService.createChatSession({});
      if (response && response.id) {
        router.push(`/chat/${response.id}`);
      } else if (pathname !== '/chat') {
        router.push(`/chat`);
      } else {
        window.location.reload(); // Quick reset if no ID returned
      }
    } catch (error) {
      console.error("Failed to create chat session:", error);
    }
  };

  const handleClick = (id: string) => {
    router.push(`/chat/${id}`);
  };

  return (
    <nav className="flex-1">
      <button
        onClick={handleNewChat}
        className="inline-flex items-center gap-1 px-3 py-4 cursor-pointer"
      >
        <SquarePen width={20} height={20} strokeWidth={1.5} />
        <span className="text-xs text-neutral-900 font-medium ml-1">
          New Chat
        </span>
      </button>
      {/* Recent section */}
      <h3 className="px-2 pb-1 text-sm font-medium">Recents</h3>
      <div className="max-h-87 overflow-y-auto">
        {chatSessions?.map((chat: ChatSession) => {
          const href = `/chat/${chat.id}`;
          const isActive = pathname === href;

          return (
            <Link
              key={chat?.id}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                handleClick(chat.id);
              }}
              className={`block rounded-md px-4 mx-2 my-1 py-2 text-xs transition-colors ${
                isActive
                  ? "bg-neutral-200 text-black font-medium"
                  : "text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              {chat?.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}