"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  notificationCount?: number;
  className?: string;
}

export const DashboardHeader = ({
  onMenuClick,
  notificationCount = 0,
  className,
}: DashboardHeaderProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const MOBILE_SEARCH_INPUT_ID = "dashboard-mobile-search-input";

  const closeMobileSearch = useCallback(() => {
    setMobileSearchOpen(false);
  }, []);

  useEffect(() => {
    if (mobileSearchOpen) {
      const el = document.getElementById(MOBILE_SEARCH_INPUT_ID);
      el?.focus();
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileSearch();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileSearchOpen, closeMobileSearch]);

  const handleMobileSearchSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    // TODO: navigate to search results or trigger search
    closeMobileSearch();
  };

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4 md:px-6",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      <h1 className="hidden text-lg font-semibold text-foreground sm:block">
        Student Dashboard
      </h1>

      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
        {/* Desktop: inline search */}
        <div className="relative hidden w-full max-w-xs md:block md:max-w-sm">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search resources..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
            aria-label="Search resources"
          />
        </div>

        {/* Mobile: search icon opens dialog */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Open search"
        >
          <Search className="size-5" />
        </Button>

        {mobileSearchOpen && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 px-4 pt-[20vh] backdrop-blur-sm md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Search resources"
          >
            <button
              type="button"
              className="absolute inset-0 -z-10"
              onClick={closeMobileSearch}
              aria-label="Close search"
            />
            <form
              onSubmit={handleMobileSearchSubmit}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                id={MOBILE_SEARCH_INPUT_ID}
                type="search"
                placeholder="Type and hit Enter"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-12 rounded-lg border-border bg-background-secondary pl-4 pr-12 text-base"
                aria-label="Search resources"
              />
              <Search
                className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-foreground-muted"
                aria-hidden
              />
            </form>
          </div>
        )}

        <div className="flex flex-row items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="/dashboard/notifications"
              className="relative"
              aria-label={
                notificationCount > 0
                  ? `${notificationCount} new notifications`
                  : "Notifications"
              }
            >
              <Bell className="size-5" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent-red text-[10px] font-bold text-white">
                  {notificationCount > 2 ? "2+" : notificationCount}
                </span>
              )}
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
