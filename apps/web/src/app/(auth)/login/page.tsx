"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import * as logger from "@/lib/logger";

const ALLOWED_DOMAIN = "goa.bits-pilani.ac.in";

type LoginMode = "student" | "admin";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<LoginMode>("student");
  const [adminKey, setAdminKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(decodeURIComponent(err));
  }, [searchParams]);

  async function handleStudentSignIn() {
    setError(null);
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/", redirect: true });
    } catch (err) {
      logger.logAuth("error", { phase: "studentSignIn", message: err instanceof Error ? err.message : String(err) });
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminSignIn() {
    setError(null);
    if (!adminKey.trim()) {
      setError("Enter the admin key to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-admin-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Invalid admin key.");
        setLoading(false);
        return;
      }
      await signIn("google", { callbackUrl: "/admin", redirect: true });
    } catch (err) {
      logger.logAuth("error", { phase: "adminSignIn", message: err instanceof Error ? err.message : String(err) });
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <SmartAssistLogo />
          <div className="leading-tight">
            <span className="text-base font-semibold tracking-tight text-foreground">
              Smart Assist
            </span>
            <span className="hidden text-[10px] uppercase tracking-widest text-foreground-muted sm:block">
              Academic Platform
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-4">
          <span className="hidden text-sm text-foreground-secondary sm:inline">
            Resources
          </span>
          <ThemeToggle />
        </nav>
      </header>

      {/* ── Main ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-6 sm:px-8 lg:flex-row lg:gap-16 lg:px-12 xl:gap-24">
        {/* Left: Hero */}
        <div className="flex max-w-lg flex-col lg:max-w-xl lg:flex-1">
          {/* Badge */}
          <div className="mb-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-teal/30 bg-accent-teal/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
              Now syncing 2025
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Elevate your{" "}
            <span className="text-primary dark:text-accent-teal">
              Academic Journey
            </span>
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-md text-base leading-relaxed text-foreground-secondary sm:text-lg">
            Access your personalized dashboard, collaborate with peers, and
            master your courses with AI&#8209;powered study assistance.
          </p>

          {/* Feature cards */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-10">
            <FeatureCard
              icon={<RoutingIcon />}
              title="Smart Routing"
              description="Intelligent prerequisite mapping and path optimization."
            />
            <FeatureCard
              icon={<SyncIcon />}
              title="Course Sync"
              description="Real-time schedule and material updates across devices."
            />
          </div>
        </div>

        {/* Right: Login card */}
        <div className="mt-10 w-full max-w-md lg:mt-0 lg:max-w-sm xl:max-w-md">
          <div className="rounded-2xl border border-border bg-background-secondary p-6 shadow-lg sm:p-8 dark:border-border-strong dark:shadow-[0_0_40px_-12px_rgba(45,212,191,0.15)]">
            {/* Card header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Sign In</h2>
              {/* Student / Admin toggle */}
              <div className="flex rounded-lg bg-background-tertiary p-0.5">
                <button
                  type="button"
                  onClick={() => { setMode("student"); setError(null); }}
                  className={`rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    mode === "student"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground-muted hover:text-foreground-secondary"
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("admin"); setError(null); }}
                  className={`rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    mode === "admin"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground-muted hover:text-foreground-secondary"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <p className="mt-1 text-sm text-foreground-muted">
              {mode === "student"
                ? "Sign in with your BITS Google account."
                : "Enter admin key, then sign in with Google."}
            </p>

            {/* Admin key field */}
            {mode === "admin" && (
              <div className="mt-5">
                <label
                  htmlFor="admin-key"
                  className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-foreground-secondary"
                >
                  Secret Key
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                    <KeyIcon />
                  </span>
                  <input
                    id="admin-key"
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter admin key"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/20"
                    autoComplete="off"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-4 rounded-lg bg-accent-red/10 px-3 py-2 text-sm text-accent-red" role="alert">
                {error}
              </p>
            )}

            {/* Google sign-in button */}
            <div className="mt-6">
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-foreground-muted">
                Institutional Login
              </p>
              <button
                type="button"
                onClick={mode === "student" ? handleStudentSignIn : handleAdminSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-background-secondary hover:shadow-md disabled:opacity-60 dark:border-border-strong dark:hover:border-accent-teal/40"
              >
                {loading ? (
                  <span className="text-foreground-secondary">Signing in…</span>
                ) : (
                  <>
                    <GoogleColorIcon className="h-5 w-5" />
                    <span>
                      Continue with Google
                      {mode === "admin" ? " (Admin)" : ""}
                    </span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-5 text-center text-[11px] leading-relaxed text-foreground-muted">
              Only <strong>@{ALLOWED_DOMAIN}</strong> accounts are accepted.
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer / Course badges ── */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4 sm:px-8 lg:px-12">
        <div className="flex flex-wrap gap-2">
          <CourseBadge color="green" label="CS211 DSA" />
          <CourseBadge color="teal" label="CS241 MUP" />
          <CourseBadge color="orange" label="MA302 Stats" />
        </div>
        <p className="text-xs text-foreground-muted">
          &copy; {new Date().getFullYear()} Smart Assist Academic Platform
        </p>
      </footer>
    </div>
  );
}

/* ─── Sub-components ─── */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background-secondary p-4 transition-shadow hover:shadow-md dark:border-border-strong dark:hover:border-accent-teal/30">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-muted text-primary dark:bg-accent-teal/10 dark:text-accent-teal">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-foreground-secondary">
        {description}
      </p>
    </div>
  );
}

function CourseBadge({
  color,
  label,
}: {
  color: "green" | "teal" | "orange";
  label: string;
}) {
  const dotColor = {
    green: "bg-accent-green",
    teal: "bg-accent-teal",
    orange: "bg-accent-orange",
  }[color];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-secondary px-3 py-1 text-[11px] font-medium text-foreground-secondary">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}

/* ─── Icons ─── */

function SmartAssistLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-primary dark:text-accent-teal">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <circle cx="16" cy="11" r="2.5" fill="currentColor" />
      <circle cx="10" cy="19" r="2.5" fill="currentColor" />
      <circle cx="22" cy="19" r="2.5" fill="currentColor" />
      <line x1="16" y1="13.5" x2="10" y2="16.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="13.5" x2="22" y2="16.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="19" x2="22" y2="19" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function RoutingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l3-9 4 18 3-9h4" />
    </svg>
  );
}

function SyncIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function GoogleColorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09A6.56 6.56 0 015.5 12c0-.72.13-1.43.35-2.09V7.07H2.18A11.01 11.01 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
