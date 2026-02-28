"use client";

// Login page — NextAuth Google OAuth (Mit)
// Domain-restricted to @goa.bits-pilani.ac.in

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-semibold">CSIS SmartAssist — Login</h1>
      <p className="text-muted-foreground text-center text-sm">
        Sign in with your college Google account (@goa.bits-pilani.ac.in)
      </p>
      {/* TODO: Add signIn("google") button — wire to NextAuth */}
      <button
        type="button"
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Sign in with Google
      </button>
    </div>
  );
}
