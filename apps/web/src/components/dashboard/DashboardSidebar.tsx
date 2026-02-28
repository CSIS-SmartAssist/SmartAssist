"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  History,
  HelpCircle,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardUser } from "@/app/dashboard/_types";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat RAG", icon: MessageSquare },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/dashboard/history", label: "History", icon: History },
];

const supportNav = [
  { href: "/help", label: "Help Center", icon: HelpCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  user: DashboardUser | null;
  open?: boolean;
  onClose?: () => void;
  className?: string;
}

export const DashboardSidebar = ({
  user,
  open = true,
  onClose,
  className,
}: DashboardSidebarProps) => {
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState<boolean>(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut({ callbackUrl: "/", redirect: true });
    } finally {
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

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {mainNav.map((item) => {
          const isActive = pathname === item.href;
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
              <Icon className="size-5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-6">
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
      </nav>

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
