"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import type { DashboardUser } from "@/app/dashboard/_types";
import * as logger from "@/lib/logger";
import type { ChatListItem } from "./_types";

type ChatSidebarContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  addOrUpdateChat: (chat: ChatListItem) => void;
};

const ChatSidebarContext = createContext<ChatSidebarContextValue | null>(null);

export const useChatSidebar = () => {
  const ctx = useContext(ChatSidebarContext);
  return ctx ?? { sidebarOpen: false, setSidebarOpen: () => {}, addOrUpdateChat: () => {} };
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
  const hasLoadedChatsOnce = useRef(false);

  const isChatRoute = pathname === "/chat" || pathname.startsWith("/chat/");
  const currentChatId =
    pathname.startsWith("/chat/c/") ?
      pathname.replace(/^\/chat\/c\//, "").split("/")[0] ?? null
    : null;

  const loadChats = async (showLoading: boolean) => {
    if (showLoading) setChatsLoading(true);
    try {
      const res = await fetch("/api/chats");
      if (!res.ok) return;
      const data = (await res.json()) as { chats?: ChatListItem[] };
      if (Array.isArray(data.chats)) setChats(data.chats);
    } catch (err) {
      logger.logApi("error", "/api/chats (client)", { message: err instanceof Error ? err.message : String(err) });
    } finally {
      if (showLoading) setChatsLoading(false);
    }
  };

  useEffect(() => {
    if (!isChatRoute) return;
    const showLoading = !hasLoadedChatsOnce.current;
    if (showLoading) hasLoadedChatsOnce.current = true;
    loadChats(showLoading);
  }, [pathname, isChatRoute]);

  const dashboardUser: DashboardUser | null = session?.user
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }
    : null;

  const addOrUpdateChat = useCallback((chat: ChatListItem) => {
    setChats((prev) => {
      const idx = prev.findIndex((c) => c.id === chat.id);
      const next = [...prev];
      if (idx >= 0) {
        next[idx] = { ...next[idx], ...chat, updatedAt: chat.updatedAt ?? Date.now() };
      } else {
        next.unshift({
          id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt ?? Date.now(),
          updatedAt: chat.updatedAt ?? Date.now(),
        });
      }
      return next;
    });
  }, []);

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
      value={{ sidebarOpen, setSidebarOpen, addOrUpdateChat }}
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
