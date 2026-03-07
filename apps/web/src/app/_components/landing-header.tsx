import Link from "next/link";
import { SmartAssistLogo } from "./landing-icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const LandingHeader = () => (
  <header className="flex h-14 min-h-14 shrink-0 items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-16">
    <Link
      href="/"
      className="flex min-w-0 shrink items-center gap-2 sm:gap-3"
      aria-label="CSIS SmartAssist Home"
    >
      <SmartAssistLogo />
      <span className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
        CSIS SmartAssist
      </span>
    </Link>

    <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
      <span className="hidden cursor-pointer text-sm text-foreground-secondary transition-colors hover:text-foreground hover:underline hover:underline-offset-2 hover:decoration-primary dark:hover:decoration-accent-teal sm:inline">
        Help
      </span>
      <Link
        href="/login"
        className="min-h-9 min-w-9 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-secondary dark:border-border-strong dark:hover:bg-accent-teal/40 sm:px-4 sm:py-1.5"
      >
        Sign In
      </Link>
      <ThemeToggle showLabel className="shrink-0" />
    </nav>
  </header>
);
