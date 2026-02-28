import Link from "next/link";
import { SmartAssistLogo } from "./landing-icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const LandingHeader = () => (
  <header className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-16">
    <Link href="/" className="flex items-center gap-2.5">
      <SmartAssistLogo />
      <span className="text-base font-bold tracking-tight text-foreground">
        CSIS SmartAssist
      </span>
    </Link>

    <nav className="flex items-center gap-3">
      <span className="hidden text-sm text-foreground-secondary hover:text-foreground sm:inline cursor-pointer transition-colors">
        Help
      </span>
      <Link
        href="/login"
        className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-background-secondary dark:border-border-strong dark:hover:border-accent-teal/40"
      >
        Sign In
      </Link>
      <ThemeToggle showLabel />
    </nav>
  </header>
);
