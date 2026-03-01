"use client";

import { ReactNode } from "react";
import { useTheme } from "next-themes";
import { NavigationShell } from "@/components/navigation/NavigationShell";
import { MobileTopBar } from "@/components/navigation/MobileTopBar";
import { usePathname } from "next/navigation";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { theme } = useTheme();
  const pathname = usePathname();

  return (
    <>
      <MobileTopBar />
      <div className="flex h-screen flex-col gap-4 bg-gradient-to-br from-slate-50 to-slate-100 p-3 pt-16 pb-3 dark:from-slate-950 dark:to-slate-900 lg:flex-row lg:pt-3">
        <div className="hidden lg:block w-72">
          <NavigationShell variant={theme === "light" ? "light" : "dark"} activeRoute={pathname} />
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </>
  );
};
