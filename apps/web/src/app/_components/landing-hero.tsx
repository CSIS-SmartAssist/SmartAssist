import Image from "next/image";
import Link from "next/link";
import { SparkleIcon } from "./landing-icons";

export const LandingHero = () => (
  <section className="relative overflow-hidden bg-background-secondary px-5 py-16 sm:px-8 sm:py-20 lg:px-16 lg:py-28">
    {/* Glow orbs */}
    <div
      className="glow-orb glow-orb-primary -top-40 right-[-8%]"
      aria-hidden="true"
    />
    <div
      className="glow-orb glow-orb-secondary -bottom-32 -left-[6%]"
      aria-hidden="true"
    />

    <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
      {/* Left column */}
      <div className="flex max-w-xl flex-col lg:flex-1">
        <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Your Campus,
          <br />
          <span className="text-glow text-primary dark:text-accent-teal">
            Simplified.
          </span>
        </h1>

        <p className="mt-5 max-w-md text-base leading-relaxed text-foreground-secondary sm:text-lg">
          Navigate university life effortlessly. Get instant answers from AI,
          book resources in seconds, and streamline administrative approvals all
          in one place.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-teal px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 dark:bg-accent-teal"
          >
            <SparkleIcon className="h-4 w-4" />
            Demo / Try
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background-tertiary dark:border-border-strong dark:hover:border-accent-teal/40"
          >
            Sign In
          </Link>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-foreground-muted">
          <span className="h-1 w-1 rounded-full bg-accent-green" />
          Instant answers
          <span className="mx-1">·</span>
          Book & get approvals in one place
        </p>
      </div>

      {/* Right column — hero image (theme-aware via html.dark class) */}
      <div className="relative w-full max-w-md lg:max-w-lg lg:flex-1">
        <div className="neon-card overflow-hidden rounded-2xl">
          <Image
            src="/hero-light.png"
            alt="SmartAssist chat interface preview"
            width={640}
            height={480}
            priority
            className="light-only h-auto w-full object-cover"
          />
          <Image
            src="/hero-dark.png"
            alt="SmartAssist chat interface preview"
            width={640}
            height={480}
            priority
            className="dark-only h-auto w-full object-cover"
          />
        </div>
      </div>
    </div>
  </section>
);
