import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  Key,
  Layers,
  Rocket,
  Server,
  Shield,
  Terminal,
  GitBranch,
  ExternalLink,
} from "lucide-react";
import { LandingFooter } from "../../_components/landing-footer";

const GITHUB_URL = "https://github.com/CSIS-SmartAssist/SmartAssist";

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs font-mono text-foreground dark:border-border-strong sm:text-sm">
    <code>{children}</code>
  </pre>
);

const DocSection = ({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="scroll-mt-28">
    <div className="mb-4 flex items-center gap-2 text-primary dark:text-accent-teal">
      <Icon className="size-5 shrink-0" />
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    </div>
    <div className="space-y-4 text-sm leading-relaxed text-foreground-secondary">
      {children}
    </div>
  </section>
);

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    className="block rounded-md py-1.5 pl-3 text-sm text-foreground-muted transition-colors hover:bg-background-secondary hover:text-foreground"
  >
    {children}
  </a>
);

const TOC_LINKS = [
  { href: "#overview", label: "Overview" },
  { href: "#architecture", label: "Architecture" },
  { href: "#tech-stack", label: "Tech stack" },
  { href: "#prerequisites", label: "Prerequisites" },
  { href: "#setup", label: "Setup" },
  { href: "#scripts", label: "Scripts" },
  { href: "#environment", label: "Environment" },
  { href: "#security", label: "Security" },
  { href: "#deployment", label: "Deployment" },
  { href: "#contributing", label: "Contributing" },
  { href: "#references", label: "References" },
];

const DeveloperDocsPage = () => (
  <div className="flex min-h-screen flex-col bg-background font-sans">
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/docs"
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-transparent p-2 text-sm font-medium text-foreground-secondary transition-colors hover:border-primary hover:text-foreground dark:hover:border-accent-teal"
          aria-label="Back to documentation"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to documentation
        </Link>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <article className="min-w-0 flex-1 order-2 lg:order-1">
            <header className="mb-10">
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 dark:bg-accent-teal/10">
                  <BookOpen className="size-8 text-primary dark:text-accent-teal" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Developer docs
                  </h1>
                  <p className="text-sm text-foreground-muted">
                    CSIS SmartAssist — setup, architecture &amp; contributing
                  </p>
                </div>
              </div>
              <p className="max-w-xl text-sm text-foreground-secondary">
                Technical documentation for the SmartAssist monorepo:
                architecture, setup, environment variables, scripts, security
                and deployment.
              </p>
            </header>

            <div className="space-y-14">
              <DocSection id="overview" icon={BookOpen} title="Overview">
                <p>
                  CSIS SmartAssist is a{" "}
                  <strong className="text-foreground">
                    smart chatbot + room booking system
                  </strong>{" "}
                  for the BITS Goa CS department. Students ask questions about
                  policies, TA forms, and lab rules (AI answers with citations),
                  check room availability, and book rooms. Admins approve/reject
                  bookings (Google Calendar + email), upload documents to the AI
                  knowledge base, and sync a Google Drive folder (manual + daily
                  via Inngest).
                </p>
              </DocSection>

              <DocSection id="architecture" icon={Layers} title="Architecture">
                <p>
                  The browser talks only to Next.js. Next.js handles auth,
                  bookings, admin UI, and chat; it proxies RAG requests to
                  FastAPI with an internal secret. The database (Neon) holds
                  both app data (Prisma) and vector embeddings (rag schema).
                  Inngest triggers a daily sync that hits Next.js, which then
                  calls FastAPI.
                </p>
                <CodeBlock>
                  {`
┌──────────────────────────┐
│       USER BROWSER       │
└────────────┬─────────────┘
             │
┌────────────▼──────────────────────────┐
│        NEXT.JS (apps/web)             │
│  Auth · Bookings · Admin · Chat proxy │
└──────┬──────────────────┬─────────────┘
       │                  │
       │     ┌────────────▼────────────────┐
       │     │   FASTAPI (apps/rag)        │
       │     │   RAG: query, ingest, sync  │
       │     └────────────┬────────────────┘
       │                  │
┌──────▼──────────────────▼─────────────┐
│   NEON POSTGRES (single database)     │
│   public: User, Room, Booking, Doc    │
│   rag: embeddings (pgvector)          │
└───────────────────────────────────────┘`}
                </CodeBlock>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">Next.js</strong> — Auth,
                    business logic, bookings, admin UI, chat proxy, Inngest.
                    Never calls FastAPI from the browser; all RAG calls are
                    server-side with{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      x-internal-secret
                    </code>
                    .
                  </li>
                  <li>
                    <strong className="text-foreground">FastAPI</strong> — RAG
                    only (query, ingest, Drive sync). Protected by shared
                    secret.
                  </li>
                  <li>
                    <strong className="text-foreground">Neon</strong> — One
                    Postgres: public schema (Prisma),{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      rag
                    </code>{" "}
                    schema (pgvector).
                  </li>
                  <li>
                    <strong className="text-foreground">Inngest</strong> — Daily
                    cron (e.g. 3 AM); runs even when RAG is asleep (e.g. on
                    Render).
                  </li>
                </ul>
              </DocSection>

              <DocSection id="tech-stack" icon={Cpu} title="Tech stack">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border dark:border-border-strong">
                        <th className="py-2 pr-4 text-left font-medium text-foreground">
                          Layer
                        </th>
                        <th className="py-2 text-left font-medium text-foreground">
                          Technology
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground-secondary">
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4">Frontend + API</td>
                        <td className="py-2">Next.js (App Router), Vercel</td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4">RAG service</td>
                        <td className="py-2">FastAPI (Python), Render</td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4">Auth</td>
                        <td className="py-2">
                          NextAuth.js + Google OAuth (domain-restricted)
                        </td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4">Database</td>
                        <td className="py-2">Neon (serverless Postgres)</td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4">ORM</td>
                        <td className="py-2">Prisma 7 (@prisma/adapter-pg)</td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4">Vector store</td>
                        <td className="py-2">pgvector on Neon</td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4">LLM</td>
                        <td className="py-2">Groq (Llama 3.3 70B)</td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4">API protection</td>
                        <td className="py-2">
                          Arcjet (rate limiting, bot detection)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </DocSection>

              <DocSection
                id="prerequisites"
                icon={Terminal}
                title="Prerequisites"
              >
                <ul className="list-inside list-disc space-y-1">
                  <li>Node 18+</li>
                  <li>npm</li>
                  <li>
                    Neon account (
                    <a
                      href="https://neon.tech"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:no-underline dark:text-accent-teal"
                    >
                      neon.tech
                    </a>
                    )
                  </li>
                  <li>(Optional) Python 3.11+ for local RAG service</li>
                </ul>
              </DocSection>

              <DocSection id="setup" icon={Server} title="Setup">
                <h3 className="mt-2 font-medium text-foreground">
                  1. Clone and install
                </h3>
                <CodeBlock>{`git clone ${GITHUB_URL}
cd SmartAssist
npm install`}</CodeBlock>
                <p>
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    postinstall
                  </code>{" "}
                  in{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    packages/db
                  </code>{" "}
                  runs{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    prisma generate
                  </code>
                  . If{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    DATABASE_URL
                  </code>{" "}
                  is missing, a placeholder is used so install succeeds.
                </p>

                <h3 className="mt-4 font-medium text-foreground">
                  2. Environment variables
                </h3>
                <p>
                  Create <strong className="text-foreground">.env</strong> at
                  the <strong className="text-foreground">repo root</strong>.
                  Copy from{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    .env.example
                  </code>
                  . At minimum set{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    DATABASE_URL
                  </code>
                  . For local dev, either copy root{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    .env
                  </code>{" "}
                  to{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    apps/web/.env
                  </code>{" "}
                  or symlink it.
                </p>

                <h3 className="mt-4 font-medium text-foreground">
                  3. Database (Neon)
                </h3>
                <ol className="list-inside list-decimal space-y-2">
                  <li>
                    Create a project at neon.tech and set{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      DATABASE_URL
                    </code>
                    .
                  </li>
                  <li>
                    In Neon SQL Editor:{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      CREATE EXTENSION IF NOT EXISTS vector;
                    </code>
                  </li>
                  <li>
                    From repo root:{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      npm run db:push
                    </code>
                  </li>
                  <li>
                    Run{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      packages/db/migrations/001_rag_schema.sql
                    </code>{" "}
                    in Neon SQL Editor (or via psql).
                  </li>
                  <li>
                    (Optional){" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      cd packages/db && npm run seed
                    </code>
                  </li>
                </ol>

                <h3 className="mt-4 font-medium text-foreground">
                  4. Arcjet (optional)
                </h3>
                <p>
                  For rate limiting and bot detection, add{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    ARCJET_KEY
                  </code>{" "}
                  from{" "}
                  <a
                    href="https://app.arcjet.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary dark:text-accent-teal underline underline-offset-2"
                  >
                    app.arcjet.com
                  </a>
                  . Without it, APIs still work; protection is skipped.
                </p>

                <h3 className="mt-4 font-medium text-foreground">
                  5. Run the apps
                </h3>
                <CodeBlock>{`# Next.js — http://localhost:3000
npm run dev:web

# FastAPI RAG — http://localhost:8000 (set RAG_SERVICE_URL in .env)
npm run dev:rag

# Prisma Studio
npm run db:studio`}</CodeBlock>
              </DocSection>

              <DocSection id="scripts" icon={Terminal} title="Scripts">
                <p className="text-foreground-muted">All from repo root.</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border dark:border-border-strong">
                        <th className="py-2 pr-4 text-left font-medium text-foreground">
                          Command
                        </th>
                        <th className="py-2 text-left font-medium text-foreground">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground-secondary">
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4 font-mono text-xs">
                          npm install
                        </td>
                        <td className="py-2">
                          Install workspaces; runs prisma generate
                        </td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4 font-mono text-xs">
                          npm run dev:web
                        </td>
                        <td className="py-2">Start Next.js (apps/web)</td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4 font-mono text-xs">
                          npm run dev:rag
                        </td>
                        <td className="py-2">Start FastAPI RAG (apps/rag)</td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4 font-mono text-xs">
                          npm run db:generate
                        </td>
                        <td className="py-2">Regenerate Prisma client</td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4 font-mono text-xs">
                          npm run db:push
                        </td>
                        <td className="py-2">Push schema to DB</td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4 font-mono text-xs">
                          npm run db:studio
                        </td>
                        <td className="py-2">Open Prisma Studio</td>
                      </tr>
                      <tr className="border-b border-border/70 dark:border-border-strong/70">
                        <td className="py-2 pr-4 font-mono text-xs">
                          npm run build
                        </td>
                        <td className="py-2">Build all workspaces</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </DocSection>

              <DocSection
                id="environment"
                icon={Key}
                title="Environment variables"
              >
                <p>
                  See{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    .env.example
                  </code>{" "}
                  at repo root. Summary:{" "}
                  <strong className="text-foreground">DATABASE_URL</strong>,{" "}
                  <strong className="text-foreground">NEXTAUTH_*</strong>,{" "}
                  <strong className="text-foreground">GOOGLE_CLIENT_*</strong>,{" "}
                  <strong className="text-foreground">ADMIN_SECRET_KEY</strong>,{" "}
                  <strong className="text-foreground">INTERNAL_SECRET</strong>,{" "}
                  <strong className="text-foreground">RAG_SERVICE_URL</strong>,{" "}
                  <strong className="text-foreground">GROQ_API_KEY</strong>,{" "}
                  <strong className="text-foreground">GOOGLE_DRIVE_*</strong>,{" "}
                  <strong className="text-foreground">
                    GOOGLE_CALENDAR_ID
                  </strong>
                  , <strong className="text-foreground">SMTP_*</strong>,{" "}
                  <strong className="text-foreground">ARCJET_KEY</strong>,{" "}
                  <strong className="text-foreground">INNGEST_*</strong>.
                </p>
              </DocSection>

              <DocSection id="security" icon={Shield} title="Security">
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">
                      Browser never calls FastAPI.
                    </strong>{" "}
                    All RAG requests go through Next.js with{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      x-internal-secret
                    </code>
                    .
                  </li>
                  <li>
                    <strong className="text-foreground">INTERNAL_SECRET</strong>{" "}
                    must match in Next.js and FastAPI.
                  </li>
                  <li>Admin routes check user role server-side.</li>
                  <li>
                    With{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      ARCJET_KEY
                    </code>
                    , Arcjet applies rate limiting and bot detection.
                  </li>
                  <li>
                    Secrets stay in{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      .env
                    </code>
                    ; never commit or log them.
                  </li>
                </ul>
              </DocSection>

              <DocSection id="deployment" icon={Rocket} title="Deployment">
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    <strong className="text-foreground">Next.js</strong> →
                    Vercel (root:{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      apps/web
                    </code>
                    ). Set all env vars from{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      .env.example
                    </code>
                    .
                  </li>
                  <li>
                    <strong className="text-foreground">FastAPI</strong> →
                    Render (root:{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      apps/rag
                    </code>
                    , Docker). Set{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      DATABASE_URL
                    </code>
                    ,{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      GROQ_API_KEY
                    </code>
                    ,{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      INTERNAL_SECRET
                    </code>
                    , Google Drive vars.
                  </li>
                  <li>
                    <strong className="text-foreground">Inngest</strong> —
                    Register production Next.js URL; cron runs at 3 AM and calls
                    Next.js → FastAPI{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                      /rag/ingest/sync
                    </code>
                    .
                  </li>
                </ul>
              </DocSection>

              <DocSection
                id="contributing"
                icon={GitBranch}
                title="Contributing"
              >
                <p>
                  Branch workflow:{" "}
                  <strong className="text-foreground">
                    feature-branch → development → main
                  </strong>
                  . Use{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    feature/
                  </code>
                  ,{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    bugfix/
                  </code>
                  ,{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    update/
                  </code>
                  ,{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    release/
                  </code>{" "}
                  and conventional commits.{" "}
                  <strong className="text-foreground">
                    Never open PRs directly to main.
                  </strong>{" "}
                  See{" "}
                  <strong className="text-foreground">CONTRIBUTING.md</strong>{" "}
                  in the repo.
                </p>
              </DocSection>

              <DocSection
                id="references"
                icon={ExternalLink}
                title="References"
              >
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/help"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline dark:text-accent-teal"
                    >
                      Help Center <ExternalLink className="size-3.5" />
                    </Link>{" "}
                    — User-facing help and FAQ
                  </li>
                  <li>
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline dark:text-accent-teal"
                    >
                      GitHub — CSIS-SmartAssist/SmartAssist{" "}
                      <ExternalLink className="size-3.5" />
                    </a>
                  </li>
                  <li>
                    <span className="text-foreground-muted">
                      CONTRIBUTING.md
                    </span>{" "}
                    — Branch workflow and commit conventions
                  </li>
                  <li>
                    <span className="text-foreground-muted">.env.example</span>{" "}
                    — Full environment variable list
                  </li>
                </ul>
              </DocSection>
            </div>
          </article>

          <aside className="shrink-0 order-1 lg:order-2 lg:w-56">
            <nav
              aria-label="Documentation sections"
              className="rounded-xl border border-border bg-card px-4 py-3 dark:border-border-strong lg:sticky lg:top-24"
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                On this page
              </p>
              <div className="flex flex-col gap-0.5">
                {TOC_LINKS.map(({ href, label }) => (
                  <NavLink key={href} href={href}>
                    {label}
                  </NavLink>
                ))}
              </div>
            </nav>
          </aside>
        </div>
      </div>
    </main>
    <LandingFooter />
  </div>
);

export default DeveloperDocsPage;
