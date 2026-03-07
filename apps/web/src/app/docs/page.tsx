import Link from "next/link";
import { ArrowLeft, BookOpen, Code2, User } from "lucide-react";
import { LandingFooter } from "../_components/landing-footer";

const DocsChoicePage = () => (
  <div className="flex min-h-screen flex-col bg-background font-sans">
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-14 lg:px-16">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 rounded-xl border border-transparent p-2 text-sm font-medium text-foreground-secondary transition-colors hover:border-primary hover:text-foreground dark:hover:border-accent-teal"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to home
        </Link>

        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-4 dark:bg-accent-teal/10">
            <BookOpen className="size-12 text-primary dark:text-accent-teal" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Documentation
          </h1>
          <p className="mt-3 max-w-lg mx-auto text-sm text-foreground-secondary sm:text-base">
            Set up and contribute as a developer, or learn how
            to use SmartAssist as a student or staff.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/docs/developer"
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5 dark:border-border-strong dark:hover:border-accent-teal dark:hover:shadow-accent-teal/5"
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-accent-teal/10 dark:text-accent-teal">
              <Code2 className="size-7" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Developer</h2>
            <p className="mt-1 text-sm font-medium text-primary dark:text-accent-teal">
              Want to contribute?
            </p>
            <p className="mt-3 flex-1 text-sm text-foreground-secondary">
              Architecture, setup, environment variables, scripts, security, and
              deployment. Everything you need to run the stack locally or ship
              changes.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary dark:text-accent-teal">
              View developer docs
              <span
                className="transition-transform group-hover:translate-x-1"
                aria-hidden
              >
                →
              </span>
            </span>
          </Link>

          <Link
            href="/docs/user"
            className="group flex flex-col rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5 dark:border-border-strong dark:hover:border-accent-teal dark:hover:shadow-accent-teal/5"
          >
            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-accent-teal/10 dark:text-accent-teal">
              <User className="size-7" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">User</h2>
            <p className="mt-1 text-sm font-medium text-primary dark:text-accent-teal">
              Learn how to use the app
            </p>
            <p className="mt-3 flex-1 text-sm text-foreground-secondary">
              A short walkthrough: sign in, dashboard, chat with Smart Assist,
              and book rooms. Get the most out of SmartAssist in a few steps.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary dark:text-accent-teal">
              View user guide
              <span
                className="transition-transform group-hover:translate-x-1"
                aria-hidden
              >
                →
              </span>
            </span>
          </Link>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
);

export default DocsChoicePage;
