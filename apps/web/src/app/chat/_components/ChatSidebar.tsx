"use client";

import { PenLine, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatListItem } from "../_types";

const TITLE_MAX_LENGTH = 36;

type ChatSidebarProps = {
  chats: ChatListItem[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  className?: string;
};

export const ChatSidebar = ({
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  searchQuery,
  onSearchChange,
  className = "",
}: ChatSidebarProps) => {
  const filteredChats = searchQuery.trim()
    ? chats.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : chats;

  const truncate = (title: string) =>
    title.length > TITLE_MAX_LENGTH
      ? `${title.slice(0, TITLE_MAX_LENGTH)}...`
      : title;

  return (
    <aside
      className={`flex w-65 shrink-0 flex-col border-r border-border bg-background/95 ${className}`}
      aria-label="Chat history"
    >
      <div className="flex flex-col gap-2 p-3">
        <Button
          variant="ghost"
          className="h-10 justify-start gap-2 rounded-lg font-medium"
          onClick={onNewChat}
          aria-label="New chat"
        >
          <PenLine className="size-4 shrink-0" />
          New chat
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
          <Input
            type="search"
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 rounded-lg border-border/80 bg-background-secondary/60 pl-9 text-sm"
            aria-label="Search chats"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          Your chats
        </p>
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
          {filteredChats.length === 0 ? (
            <li className="px-2 py-4 text-center text-sm text-foreground-muted">
              {searchQuery.trim()
                ? "No chats match your search"
                : "No past chats yet"}
            </li>
          ) : (
            filteredChats.map((chat) => {
              const isActive = currentChatId === chat.id;
              return (
                <li key={chat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/50 ${
                      isActive ? "bg-accent/80 text-foreground" : "text-foreground-secondary"
                    }`}
                    title={chat.title}
                  >
                    <span className="block truncate">
                      {truncate(chat.title)}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </aside>
  );
};
