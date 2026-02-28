"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Use this to toggle light/dark in the app.
 * Waits for mount so resolvedTheme is correct (avoids hydration + wrong initial toggle).
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  if (!mounted) {
    return (
      <span className="rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm font-medium text-foreground-secondary">
        …
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg border border-border bg-background-secondary px-3 py-2 text-sm font-medium text-foreground hover:bg-background-tertiary"
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {resolvedTheme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
