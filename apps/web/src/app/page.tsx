import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <span className="text-lg font-semibold text-foreground">SmartAssist</span>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Elevate your academic journey
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-foreground-secondary">
            Ask questions, book rooms, and get answers with citations — all in one place.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/chat"
            className="flex h-12 items-center justify-center rounded-lg bg-primary px-6 font-medium text-foreground-on-accent transition-colors hover:bg-primary-hover"
          >
            Chat
          </Link>
          <Link
            href="/bookings"
            className="flex h-12 items-center justify-center rounded-lg border border-border bg-background-secondary px-6 font-medium text-foreground transition-colors hover:bg-background-tertiary"
          >
            Book a room
          </Link>
        </div>
      </main>
    </div>
  );
}
