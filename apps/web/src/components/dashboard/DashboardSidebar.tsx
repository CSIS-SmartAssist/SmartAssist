"use client";

import { useState } from "react";
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
} from "lucide-react";
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
  createdAt: number;
  updatedAt?: number;
};

export type ChatListSidebarProps = {
  chats: ChatListItemSidebar[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
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
  const isChatPage = pathname === "/chat" || pathname.startsWith("/chat/");
  const showChatList = isChatPage && chatList;

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
      logger.logAuth("error", { phase: "signOut", message: err instanceof Error ? err.message : String(err) });
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
            <p className="mb-2 mt-3 shrink-0 px-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
              Your chats
            </p>
            <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
              {chatList.loading ? (
                <li className="px-2 py-4 text-center text-sm text-foreground-muted">
                  Loading…
                </li>
              ) : (() => {
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
                    return (
                      <li key={chat.id}>
                        <Link
                          href={`/chat/c/${chat.id}`}
                          onClick={onClose}
                          className={cn(
                            "block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/50",
                            isActive
                              ? "bg-accent/80 text-foreground"
                              : "text-foreground-secondary",
                          )}
                          title={chat.title}
                        >
                          <span className="block truncate">{title}</span>
                        </Link>
                      </li>
                    );
                  })
                );
              })()}
            </ul>
          </div>
        )}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border">
        <div className="p-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
            Support
          </p>
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
