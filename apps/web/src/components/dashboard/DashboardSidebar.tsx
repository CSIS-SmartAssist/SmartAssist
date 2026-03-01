"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  HelpCircle,
  Settings,
  LogOut,
  Loader2,
  PenLine,
  Search,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Pin,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import * as logger from "@/lib/logger";
import { cn } from "@/lib/utils";
import type { DashboardUser } from "@/app/dashboard/_types";
import { Input } from "@/components/ui/input";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/bookings", label: "Bookings", icon: Calendar },
];

const supportNav = [
  { href: "/help", label: "Help Center", icon: HelpCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const CHAT_TITLE_MAX_LEN = 32;

export type ChatListItemSidebar = {
  id: string;
  title: string;
  pinned?: boolean;
  createdAt: number;
  updatedAt?: number;
};

export type ChatListSidebarProps = {
  chats: ChatListItemSidebar[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => Promise<void>;
  onDeleteChat: (id: string) => Promise<void>;
  onPinChat: (id: string, pinned: boolean) => Promise<void>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
};

interface DashboardSidebarProps {
  user: DashboardUser | null;
  open?: boolean;
  onClose?: () => void;
  className?: string;
  /** When on /chat, pass this to show New chat + Your chats in the sidebar */
  chatList?: ChatListSidebarProps | null;
}

export const DashboardSidebar = ({
  user,
  open = true,
  onClose,
  className,
  chatList = null,
}: DashboardSidebarProps) => {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState<boolean>(false);
  const [supportExpanded, setSupportExpanded] = useState<boolean>(false);
  const [chatsSectionExpanded, setChatsSectionExpanded] =
    useState<boolean>(true);
  const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const isChatPage = pathname === "/chat" || pathname.startsWith("/chat/");

  useEffect(() => {
    if (!openMenuChatId) return;
    const handleClickOutside = (e: MouseEvent) => {
      const el = e.target as Element;
      if (el.closest?.("[data-chat-menu]")) return;
      setOpenMenuChatId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuChatId]);
  const showChatList = isChatPage && chatList;
  const isSupportActive = supportNav.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const supportOpen = supportExpanded || isSupportActive;

  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: "/", redirect: true });
      // On success we redirect; spinner stays until page unmounts
    } catch (err) {
      logger.logAuth("error", {
        phase: "signOut",
        message: err instanceof Error ? err.message : String(err),
      });
      setSigningOut(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const content = (
    <>
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <span className="text-sm font-bold">S</span>
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">SmartAssist</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-foreground-secondary">
            Student Dashboard
          </p>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
        <div className="shrink-0 space-y-1">
          {mainNav.map((item) => {
            const isActive = isItemActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-foreground-secondary hover:bg-background-tertiary hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-foreground-secondary",
                  )}
                  aria-hidden
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {showChatList && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-6">
            <Link
              href="/chat"
              onClick={onClose}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-background-tertiary hover:text-foreground"
            >
              <PenLine className="size-5 shrink-0" aria-hidden />
              New chat
            </Link>
            <div className="relative mt-2 shrink-0">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
              <Input
                type="search"
                placeholder="Search chats"
                value={chatList.searchQuery}
                onChange={(e) => chatList.onSearchChange(e.target.value)}
                className="h-9 rounded-lg border-border/80 bg-background-secondary/60 pl-9 text-sm"
                aria-label="Search chats"
              />
            </div>
            <button
              type="button"
              onClick={() => setChatsSectionExpanded((e) => !e)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted transition-colors hover:bg-background-tertiary"
              aria-expanded={chatsSectionExpanded}
            >
              Your chats
              {chatsSectionExpanded ? (
                <ChevronDown className="size-4 shrink-0" aria-hidden />
              ) : (
                <ChevronRight className="size-4 shrink-0" aria-hidden />
              )}
            </button>
            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col overflow-hidden",
                !chatsSectionExpanded && "hidden",
              )}
            >
              <div className="min-h-0 flex-1 pr-5">
                <ul className="sidebar-chat-list-scroll h-full min-h-0 space-y-0.5 overflow-y-auto px-2 pb-2">
                  {chatList.loading ? (
                    <li className="px-2 py-4 text-center text-sm text-foreground-muted">
                      Loading…
                    </li>
                  ) : (
                    (() => {
                      const q = chatList.searchQuery.trim().toLowerCase();
                      const filtered = q
                        ? chatList.chats.filter((c) =>
                            c.title.toLowerCase().includes(q),
                          )
                        : chatList.chats;
                      return filtered.length === 0 ? (
                        <li className="px-2 py-4 text-center text-sm text-foreground-muted">
                          {q ? "No chats match" : "No past chats yet"}
                        </li>
                      ) : (
                        filtered.map((chat) => {
                          const isActive = chatList.currentChatId === chat.id;
                          const title =
                            chat.title.length > CHAT_TITLE_MAX_LEN
                              ? `${chat.title.slice(0, CHAT_TITLE_MAX_LEN)}...`
                              : chat.title;
                          const menuOpen = openMenuChatId === chat.id;
                          return (
                            <li key={chat.id} className="group relative">
                              <div
                                className={cn(
                                  "flex items-center gap-1 rounded-lg pr-1 transition-colors",
                                  isActive && "bg-accent/80",
                                  !isActive && "hover:bg-accent/50",
                                )}
                              >
                                <Link
                                  href={`/chat/c/${chat.id}`}
                                  onClick={onClose}
                                  className="min-w-0 flex-1 py-2.5 pl-3 text-left text-sm text-foreground-secondary transition-colors hover:text-foreground"
                                  title={chat.title}
                                >
                                  <span className="flex items-center gap-1.5">
                                    {chat.pinned && (
                                      <Pin
                                        className="size-3.5 shrink-0 text-foreground-muted"
                                        aria-hidden
                                      />
                                    )}
                                    <span className="block truncate">
                                      {title}
                                    </span>
                                  </span>
                                </Link>
                                <div
                                  ref={menuOpen ? menuContainerRef : undefined}
                                  data-chat-menu
                                  className={cn(
                                    "relative shrink-0 transition-opacity",
                                    !menuOpen &&
                                      "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                                    menuOpen && "opacity-100",
                                  )}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setOpenMenuChatId(
                                        menuOpen ? null : chat.id,
                                      );
                                    }}
                                    className="cursor-pointer rounded p-1.5 text-foreground-muted transition-colors hover:bg-background-tertiary hover:text-foreground"
                                    aria-label="Chat options"
                                    aria-expanded={menuOpen}
                                  >
                                    <MoreVertical
                                      className="size-4"
                                      aria-hidden
                                    />
                                  </button>
                                  {menuOpen && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-10"
                                        aria-hidden
                                        onClick={() => setOpenMenuChatId(null)}
                                      />
                                      <div className="absolute right-0 top-full z-20 mt-0.5 min-w-40 rounded-lg border border-border bg-popover py-1 shadow-md">
                                        <button
                                          type="button"
                                          disabled={actionLoading}
                                          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                                          onClick={async () => {
                                            setOpenMenuChatId(null);
                                            const newTitle = window.prompt(
                                              "Rename chat",
                                              chat.title,
                                            );
                                            if (
                                              newTitle == null ||
                                              !newTitle.trim()
                                            )
                                              return;
                                            setActionLoading(true);
                                            try {
                                              await chatList.onRenameChat(
                                                chat.id,
                                                newTitle.trim(),
                                              );
                                              toast.success(
                                                "Chat renamed successfully.",
                                              );
                                            } catch {
                                              logger.warn(
                                                "chat",
                                                "Failed to rename",
                                                chat.id,
                                              );
                                              toast.error(
                                                "Failed to rename chat.",
                                              );
                                            } finally {
                                              setActionLoading(false);
                                            }
                                          }}
                                        >
                                          <PenLine
                                            className="size-4 shrink-0"
                                            aria-hidden
                                          />
                                          Rename
                                        </button>
                                        <button
                                          type="button"
                                          disabled={actionLoading}
                                          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                                          onClick={async () => {
                                            setOpenMenuChatId(null);
                                            setActionLoading(true);
                                            try {
                                              await chatList.onPinChat(
                                                chat.id,
                                                !chat.pinned,
                                              );
                                              toast.success(
                                                chat.pinned
                                                  ? "Chat unpinned."
                                                  : "Chat pinned.",
                                              );
                                            } catch {
                                              logger.warn(
                                                "chat",
                                                "Failed to pin",
                                                chat.id,
                                              );
                                              toast.error(
                                                "Failed to update pin.",
                                              );
                                            } finally {
                                              setActionLoading(false);
                                            }
                                          }}
                                        >
                                          <Pin
                                            className="size-4 shrink-0"
                                            aria-hidden
                                          />
                                          {chat.pinned ? "Unpin" : "Pin chat"}
                                        </button>
                                        <button
                                          type="button"
                                          disabled={actionLoading}
                                          className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                                          onClick={async () => {
                                            setOpenMenuChatId(null);
                                            if (
                                              !window.confirm(
                                                "Delete this chat? This cannot be undone.",
                                              )
                                            )
                                              return;
                                            setActionLoading(true);
                                            try {
                                              await chatList.onDeleteChat(
                                                chat.id,
                                              );
                                              toast.error("Chat deleted.");
                                            } catch {
                                              logger.warn(
                                                "chat",
                                                "Failed to delete",
                                                chat.id,
                                              );
                                              toast.error(
                                                "Failed to delete chat.",
                                              );
                                            } finally {
                                              setActionLoading(false);
                                            }
                                          }}
                                        >
                                          <Trash2
                                            className="size-4 shrink-0"
                                            aria-hidden
                                          />
                                          Delete
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </li>
                          );
                        })
                      );
                    })()
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border">
        <div className="p-4">
          <button
            type="button"
            onClick={() => setSupportExpanded((e) => !e)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted transition-colors hover:bg-background-tertiary"
            aria-expanded={supportOpen}
          >
            Support
            {supportOpen ? (
              <ChevronDown className="size-4 shrink-0" aria-hidden />
            ) : (
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            )}
          </button>
          <div className={cn(supportOpen ? "block" : "hidden")}>
            {supportNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-background-tertiary hover:text-foreground"
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary"
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name ?? "User"}
              </p>
              <p className="truncate text-xs text-foreground-secondary">
                {user?.email?.split("@")[0] ?? "Student"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="cursor-pointer flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-background-tertiary hover:text-foreground disabled:opacity-60"
              aria-label="Sign out"
            >
              {signingOut ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                <LogOut className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: always visible sidebar */}
      <aside
        className={cn(
          "hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex",
          className,
        )}
      >
        {content}
      </aside>
      {/* Mobile: overlay when open */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        {content}
      </aside>
    </>
  );
};
