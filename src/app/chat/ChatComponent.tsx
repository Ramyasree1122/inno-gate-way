import Link from "next/link";
import { SquarePen } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
type Chat = {
  id: string;
  title: string;
};
export default function ChatComponent() {
  const router = useRouter();

  const pathname = usePathname();

  const [chats, setChats] = useState<Chat[]>([
    {
      id: crypto.randomUUID(),
      title: "Welcome to InnoAIGateway",
    },
  ]);
  const handleNewChat = () => {
    const newChat = {
      id: crypto.randomUUID(),
      title: `New Chat ${chats.length}`,
    };

    setChats((prev) => [newChat, ...prev]);

    router.push(`/chat/${newChat.id}`);
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
        {chats.map((chat) => {
          const href = `/chat/${chat.id}`;
          const isActive = pathname === href;

          return (
            <Link
              key={chat.id}
              href={href}
              className={`block rounded-md px-4 mx-2 my-1 py-2 text-xs transition-colors ${
                isActive
                  ? "bg-neutral-200 text-black font-medium"
                  : "text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              {chat.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}