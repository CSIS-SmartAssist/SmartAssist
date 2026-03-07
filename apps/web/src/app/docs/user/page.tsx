import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { LandingFooter } from "../../_components/landing-footer";

const StepCard = ({
  step,
  title,
  description,
  href,
  linkLabel,
}: {
  step: number;
  title: string;
  description: React.ReactNode;
  href: string;
  linkLabel: string;
}) => (
  <div className="flex gap-4 rounded-xl border border-border bg-card p-5 dark:border-border-strong">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary dark:bg-accent-teal/10 dark:text-accent-teal">
      {step}
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <div className="mt-2 text-sm text-foreground-secondary">{description}</div>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline dark:text-accent-teal"
      >
        {linkLabel}
        <ChevronRight className="size-4" />
      </Link>
    </div>
  </div>
);

const UserGuidePage = () => (
  <div className="flex min-h-screen flex-col bg-background font-sans">
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/docs"
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-transparent p-2 text-sm font-medium text-foreground-secondary transition-colors hover:border-primary hover:text-foreground dark:hover:border-accent-teal"
          aria-label="Back to documentation"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to documentation
        </Link>

        <div className="mb-12">
          <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3 dark:bg-accent-teal/10">
            <BookOpen className="size-10 text-primary dark:text-accent-teal" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            User guide
          </h1>
          <p className="mt-2 text-sm text-foreground-secondary">
            A short walkthrough to get you started with SmartAssist: sign in,
            use the dashboard, chat with Smart Assist, and book rooms.
          </p>
        </div>

        <div className="space-y-6">
          <StepCard
            step={1}
            title="Sign in"
            description={
              <>
                Use your <strong className="text-foreground">@goa.bits-pilani.ac.in</strong> Google
                account. Choose <strong className="text-foreground">Student</strong> to sign in as a
                student, or <strong className="text-foreground">Admin</strong> and enter the admin
                key if you have one. After sign-in, students go to the dashboard and admins to the
                admin area.
              </>
            }
            href="/login"
            linkLabel="Go to Sign in"
          />

          <StepCard
            step={2}
            title="Dashboard"
            description={
              <>
                Your hub after sign-in: quick links to start a new chat or make a booking, plus
                upcoming bookings and recent activity. Use the sidebar to switch between Dashboard,
                Chat, and Bookings. Open <strong className="text-foreground">Support</strong> for
                Help and Settings.
              </>
            }
            href="/dashboard"
            linkLabel="Go to Dashboard"
          />

          <StepCard
            step={3}
            title="Chat with Smart Assist"
            description={
              <>
                Ask questions about courses, policies, and campus info. Type in the input and send;
                the first message creates a new chat. Use the sidebar to see &quot;Your chats&quot; —
                search, rename, pin, or delete them from the three-dot menu. Use the mic for voice
                input and the top-right menu to export a chat as PDF.
              </>
            }
            href="/chat"
            linkLabel="Go to Chat"
          />

          <StepCard
            step={4}
            title="Book rooms"
            description={
              <>
                View available rooms and resources, filter by block (D, A, C), and submit a booking
                request. Your status (Pending, Confirmed, etc.) shows on the dashboard and bookings
                page. Admins approve or reject requests; approved bookings may be added to Google
                Calendar and you may receive an email.
              </>
            }
            href="/bookings"
            linkLabel="Go to Bookings"
          />
        </div>

        <div className="mt-12 rounded-xl border border-border bg-background-secondary p-5 dark:border-border-strong">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <MessageSquare className="size-5 text-primary dark:text-accent-teal" />
            Need more help?
          </h2>
          <p className="mt-2 text-sm text-foreground-secondary">
            For detailed help, FAQs, and troubleshooting, visit the Help Center.
          </p>
          <Link
            href="/help"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline dark:text-accent-teal"
          >
            Open Help Center
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </main>
    <LandingFooter />
  </div>
);

export default UserGuidePage;
