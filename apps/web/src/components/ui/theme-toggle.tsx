"use client";

import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle = ({
  className = "",
  showLabel = false,
}: ThemeToggleProps) => {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`cursor-pointer inline-flex items-center self-start rounded-full border border-border bg-background-secondary px-4 py-2 text-foreground transition-opacity hover:opacity-90 active:opacity-70 ${className}`}
      aria-label={resolvedTheme ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
    >
      <span className="text-xl leading-none" suppressHydrationWarning>
        {isDark ? "☀️" : "🌙"}
      </span>
      {showLabel && (
        <span className="ml-1 text-sm font-medium text-foreground" suppressHydrationWarning>
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
};
