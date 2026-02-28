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
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen((o) => !o)}
          notificationCount={notificationCount}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
