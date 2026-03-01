"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import * as logger from "@/lib/logger";
import { Loader2 } from "lucide-react";
import {
  SmartAssistLogo,
  RoutingIcon,
  SyncIcon,
  KeyIcon,
  GoogleColorIcon,
} from "./_components/icons";
import { FeatureCard } from "./_components/feature-card";
import { CourseBadge } from "./_components/course-badge";
import LoginPageFallback from "./_components/LoginPageFallback";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { adminKeySchema, type AdminKeyValues } from "@/lib/validations/auth";

const ALLOWED_DOMAIN = "goa.bits-pilani.ac.in";

type LoginMode = "student" | "admin";

const LoginPageContent = () => {
  const searchParams = useSearchParams();
  const rawUrlError = searchParams.get("error") ?? "";
  const isAdminMustUseAdminLogin = rawUrlError === "AdminMustUseAdminLogin";
  const isStudentMustUseStudentLogin = rawUrlError === "StudentMustUseStudentLogin";
  const isOAuthError = rawUrlError === "OAuthSignin" || rawUrlError === "OAuthCallback";
  const [mode, setMode] = useState<LoginMode>(() =>
    isAdminMustUseAdminLogin ? "admin" : "student"
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm<AdminKeyValues>({
    resolver: zodResolver(adminKeySchema),
    defaultValues: { adminKey: "" },
  });

  const urlError = rawUrlError ? decodeURIComponent(rawUrlError) : null;
  const errorMessage =
    isAdminMustUseAdminLogin
      ? "You are an admin. Please sign in using the Admin option with your admin key."
      : isStudentMustUseStudentLogin
        ? "You are registered as a student. Please sign in using the Student option."
        : isOAuthError
          ? "Sign-in timed out. Please check your network and try again, or use a different connection (e.g. mobile hotspot)."
          : urlError;
  const error = localError ?? errorMessage;

  const rawCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl =
    typeof rawCallbackUrl === "string" &&
    rawCallbackUrl.startsWith("/") &&
    !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : "/dashboard";

  const handleStudentSignIn = async () => {
    setLocalError(null);
    setLoading(true);
    try {
      await signIn("google", { callbackUrl, redirect: true });
      // On success we redirect; spinner stays until page unmounts
    } catch (err) {
      logger.logAuth("error", {
        phase: "studentSignIn",
        message: err instanceof Error ? err.message : String(err),
      });
      setLocalError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  const handleAdminSignInWithKey = async (data: AdminKeyValues) => {
    setLocalError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-admin-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: data.adminKey.trim() }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData.ok) {
        setLocalError(resData.message ?? "Invalid admin key.");
        setLoading(false);
        return;
      }
      await signIn("google", { callbackUrl: "/admin", redirect: true });
      // On success we redirect; spinner stays until page unmounts
    } catch (err) {
      logger.logAuth("error", {
        phase: "adminSignIn",
        message: err instanceof Error ? err.message : String(err),
      });
      setLocalError("Something went wrong. Try again.");
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
                    setLocalError(null);
                    form.reset();
                  }}
                  className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
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
                    setLocalError(null);
                  }}
                  className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
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

            {/* Admin key field (RHF + zod) */}
            {mode === "admin" && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleAdminSignInWithKey)}
                  className="mt-5"
                >
                  <FormField
                    control={form.control}
                    name="adminKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                              <KeyIcon />
                            </span>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter admin key"
                              className="pl-10"
                              autoComplete="off"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-accent-red" />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
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
              {mode === "admin" ? (
                <button
                  type="button"
                  onClick={form.handleSubmit(handleAdminSignInWithKey)}
                  disabled={loading}
                  className="cursor-pointer flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-background-secondary hover:shadow-[0_0_20px_-4px_rgba(124,58,237,0.2)] disabled:opacity-60 dark:border-border-strong dark:hover:border-accent-teal/40 dark:hover:shadow-[0_0_20px_-4px_rgba(45,212,191,0.25)]"
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="h-5 w-5 animate-spin text-foreground-secondary"
                        aria-hidden
                      />
                      <span className="text-foreground-secondary">
                        Signing in…
                      </span>
                    </>
                  ) : (
                    <>
                      <GoogleColorIcon className="h-5 w-5" />
                      <span>Continue with Google (Admin)</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStudentSignIn}
                  disabled={loading}
                  className="cursor-pointer flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-background-secondary hover:shadow-[0_0_20px_-4px_rgba(124,58,237,0.2)] disabled:opacity-60 dark:border-border-strong dark:hover:border-accent-teal/40 dark:hover:shadow-[0_0_20px_-4px_rgba(45,212,191,0.25)]"
                >
                  {loading ? (
                    <>
                      <Loader2
                        className="h-5 w-5 animate-spin text-foreground-secondary"
                        aria-hidden
                      />
                      <span className="text-foreground-secondary">
                        Signing in…
                      </span>
                    </>
                  ) : (
                    <>
                      <GoogleColorIcon className="h-5 w-5" />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              )}
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

const LoginPage = () => (
  <Suspense fallback={<LoginPageFallback />}>
    <LoginPageContent />
  </Suspense>
);

export default LoginPage;
