"use client";

import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import type { DashboardUser } from "@/app/dashboard/_types";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  user: DashboardUser | null;
  notificationCount?: number;
  className?: string;
}

export const DashboardLayout = ({
  children,
  user,
  notificationCount = 0,
  className,
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div
      className={cn(
        "flex h-screen min-h-screen flex-col bg-background text-foreground md:flex-row",
        className,
      )}
    >
      <DashboardSidebar user={user} open={sidebarOpen} onClose={closeSidebar} />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div
          className="glow-orb glow-orb-primary -top-32 right-[-10%] lg:right-[5%]"
          aria-hidden
        />
        <div
          className="glow-orb glow-orb-secondary -bottom-24 -left-[8%] lg:left-[2%]"
          aria-hidden
        />
        <DashboardHeader
          onMenuClick={() => setSidebarOpen((o) => !o)}
          notificationCount={notificationCount}
        />
        <main className="relative flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
