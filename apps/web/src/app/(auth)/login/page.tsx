"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import * as logger from "@/lib/logger";
import {
  SmartAssistLogo,
  RoutingIcon,
  SyncIcon,
  KeyIcon,
  GoogleColorIcon,
} from "./_components/icons";
import { FeatureCard } from "./_components/feature-card";
import { CourseBadge } from "./_components/course-badge";

const ALLOWED_DOMAIN = "goa.bits-pilani.ac.in";

type LoginMode = "student" | "admin";

const LoginPage = () => {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<LoginMode>("student");
  const [adminKey, setAdminKey] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) setError(decodeURIComponent(err));
  }, [searchParams]);

  const handleStudentSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard", redirect: true });
    } catch (err) {
      logger.logAuth("error", {
        phase: "studentSignIn",
        message: err instanceof Error ? err.message : String(err),
      });
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSignIn = async () => {
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
      logger.logAuth("error", {
        phase: "adminSignIn",
        message: err instanceof Error ? err.message : String(err),
      });
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* ── Background glow orbs ── */}
      <div
        className="glow-orb glow-orb-primary -top-32 right-[-10%] lg:right-[5%]"
        aria-hidden="true"
      />
      <div
        className="glow-orb glow-orb-secondary -bottom-24 -left-[8%] lg:left-[2%]"
        aria-hidden="true"
      />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
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
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-6 sm:px-8 lg:flex-row lg:gap-16 lg:px-12 xl:gap-24">
        {/* Left: Hero */}
        <div className="flex max-w-lg flex-col lg:max-w-xl lg:flex-1">
          {/* Badge */}
          <div className="mb-6 flex items-center gap-2">
            <span className="badge-glow inline-flex items-center gap-1.5 rounded-full border border-accent-teal/30 bg-accent-teal/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
              Now syncing 2025
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Elevate your{" "}
            <span className="text-glow text-primary dark:text-accent-teal">
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
          <div className="neon-card rounded-2xl border border-border bg-background-secondary p-6 sm:p-8 dark:border-border-strong">
            {/* Card header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Sign In</h2>
              {/* Student / Admin toggle */}
              <div className="flex rounded-lg bg-background-tertiary p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode("student");
                    setError(null);
                  }}
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
                  onClick={() => {
                    setMode("admin");
                    setError(null);
                  }}
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
              <p
                className="mt-4 rounded-lg bg-accent-red/10 px-3 py-2 text-sm text-accent-red"
                role="alert"
              >
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
                onClick={
                  mode === "student" ? handleStudentSignIn : handleAdminSignIn
                }
                disabled={loading}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-background-secondary hover:shadow-[0_0_20px_-4px_rgba(124,58,237,0.2)] disabled:opacity-60 dark:border-border-strong dark:hover:border-accent-teal/40 dark:hover:shadow-[0_0_20px_-4px_rgba(45,212,191,0.25)]"
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
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4 sm:px-8 lg:px-12">
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
};

export default LoginPage;
