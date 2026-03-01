"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import type { DashboardUser } from "@/app/dashboard/_types";
import type { ChatListItem } from "./_types";

type ChatSidebarContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const ChatSidebarContext = createContext<ChatSidebarContextValue | null>(null);

export const useChatSidebar = () => {
  const ctx = useContext(ChatSidebarContext);
  return ctx ?? { sidebarOpen: false, setSidebarOpen: () => {} };
};

export default function ChatLayout({
  children,
}: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>("");
  const [chatsLoading, setChatsLoading] = useState<boolean>(true);

  const isChatRoute = pathname === "/chat" || pathname.startsWith("/chat/");
  const currentChatId =
    pathname.startsWith("/chat/c/") ?
      pathname.replace(/^\/chat\/c\//, "").split("/")[0] ?? null
    : null;

  const loadChats = async () => {
    setChatsLoading(true);
    try {
      const res = await fetch("/api/chats");
      if (!res.ok) return;
      const data = (await res.json()) as { chats?: ChatListItem[] };
      if (Array.isArray(data.chats)) setChats(data.chats);
    } finally {
      setChatsLoading(false);
    }
  };

  useEffect(() => {
    if (isChatRoute) loadChats();
  }, [pathname, isChatRoute]);

  const dashboardUser: DashboardUser | null = session?.user
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }
    : null;

  const sortedChats = [...chats].sort(
    (a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt),
  );

  const chatList = isChatRoute
    ? {
        chats: sortedChats,
        currentChatId,
        onNewChat: () => router.push("/chat"),
        onSelectChat: (id: string) => router.push(`/chat/c/${id}`),
        searchQuery: chatSearchQuery,
        onSearchChange: setChatSearchQuery,
        loading: chatsLoading,
      }
    : null;

  return (
    <ChatSidebarContext.Provider
      value={{ sidebarOpen, setSidebarOpen }}
    >
      <div className="relative flex h-screen min-h-0 w-full overflow-hidden">
        <DashboardSidebar
          user={dashboardUser}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          chatList={chatList}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </ChatSidebarContext.Provider>
  );
}
