"use client";

// Login / Sign up — Google OAuth only, @goa.bits-pilani.ac.in
// Student: Sign in with Google. Admin: Admin key + Sign in with Google.

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
      const res = await signIn("google", {
        callbackUrl: "/",
        redirect: true,
      });
      if (res?.error) setError("Sign-in failed. Use your @goa.bits-pilani.ac.in account.");
    } catch {
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
      const verifyRes = await fetch("/api/auth/verify-admin-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey.trim() }),
      });
      const data = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok || !data.ok) {
        setError(data.message ?? "Invalid admin key.");
        setLoading(false);
        return;
      }
      await signIn("google", {
        callbackUrl: "/admin",
        redirect: true,
      });
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-foreground">
          SmartAssist
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-background-secondary p-6 shadow-md sm:p-8">
            <h1 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
              Elevate your academic journey
            </h1>
            <p className="mt-2 text-center text-sm text-foreground-secondary">
              Sign in with your BITS mail (@{ALLOWED_DOMAIN})
            </p>

            {/* Tabs: Student | Admin */}
            <div className="mt-6 flex rounded-lg bg-background-tertiary p-1">
              <button
                type="button"
                onClick={() => { setMode("student"); setError(null); }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:py-2.5 ${
                  mode === "student"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => { setMode("admin"); setError(null); }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:py-2.5 ${
                  mode === "admin"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                Admin
              </button>
            </div>

            {mode === "admin" && (
              <div className="mt-4">
                <label htmlFor="admin-key" className="block text-sm font-medium text-foreground">
                  Admin key
                </label>
                <input
                  id="admin-key"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/20"
                  autoComplete="off"
                />
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-lg bg-accent-red/10 px-3 py-2 text-sm text-accent-red" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6">
              {mode === "student" ? (
                <button
                  type="button"
                  onClick={handleStudentSignIn}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-foreground-on-accent transition-colors hover:bg-primary-hover disabled:opacity-60"
                >
                  {loading ? (
                    <span>Signing in…</span>
                  ) : (
                    <>
                      <GoogleIcon className="h-5 w-5" />
                      Sign in with Google
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAdminSignIn}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-foreground-on-accent transition-colors hover:bg-primary-hover disabled:opacity-60"
                >
                  {loading ? (
                    <span>Signing in…</span>
                  ) : (
                    <>
                      <GoogleIcon className="h-5 w-5" />
                      Sign in with Google (Admin)
                    </>
                  )}
                </button>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-foreground-muted">
              By signing in, you agree to use only your @{ALLOWED_DOMAIN} account.
            </p>
          </div>

          <p className="mt-6 text-center">
            <Link href="/" className="text-sm text-foreground-secondary underline hover:text-foreground">
              Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
