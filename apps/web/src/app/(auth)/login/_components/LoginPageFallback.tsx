import Link from "next/link";
import { SmartAssistLogo } from "./icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const LoginPageFallback = () => (
  <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
    <div
      className="glow-orb glow-orb-primary -top-32 right-[-10%] lg:right-[5%]"
      aria-hidden="true"
    />
    <div
      className="glow-orb glow-orb-secondary -bottom-24 -left-[8%] lg:left-[2%]"
      aria-hidden="true"
    />
    <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-2">
        <SmartAssistLogo />
        <span className="text-base font-semibold tracking-tight text-foreground">
          Smart Assist
        </span>
      </Link>
      <ThemeToggle />
    </header>
    <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-6">
      <div className="neon-card w-full max-w-md animate-pulse rounded-2xl border border-border bg-background-secondary p-8">
        <div className="h-6 w-32 rounded bg-background-tertiary" />
        <div className="mt-4 h-4 w-full rounded bg-background-tertiary" />
        <div className="mt-6 h-12 w-full rounded-lg bg-background-tertiary" />
      </div>
    </main>
  </div>
);

export default LoginPageFallback;
