import Link from "next/link";
import {
  HelpCircle,
  LogIn,
  MessageSquare,
  Calendar,
  LayoutDashboard,
  Shield,
  BookOpen,
  ChevronDown,
  Mail,
  Bot,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { LandingFooter } from "../_components/landing-footer";
import { Card } from "@/components/ui/card";

const SUPPORT_EMAIL = "csisitadmin@goa.bits-pilani.ac.in";

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="scroll-mt-24">
    <div className="mb-3 flex items-center gap-2 text-primary dark:text-accent-teal">
      <Icon className="size-5 shrink-0" />
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
    <div className="space-y-3 text-sm leading-relaxed text-foreground-secondary">
      {children}
    </div>
  </section>
);

const FaqItem = ({
  question,
  answer,
}: {
  question: string;
  answer: React.ReactNode;
}) => (
  <details className="group rounded-lg border border-border bg-card dark:border-border-strong">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-left font-medium text-foreground transition-colors hover:bg-background-secondary [&::-webkit-details-marker]:hidden">
      <span>{question}</span>
      <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
    </summary>
    <div className="border-border px-4 py-3 text-sm text-foreground-secondary dark:border-border-strong">
      {answer}
    </div>
  </details>
);

const HelpPage = () => (
  <div className="flex min-h-screen flex-col bg-background font-sans">
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-transparent p-2 text-sm font-medium text-foreground-secondary transition-colors hover:border-primary hover:text-foreground dark:hover:border-accent-teal"
          aria-label="Back to Home"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Go back
        </Link>

        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary/10 p-3 dark:bg-accent-teal/10">
            <HelpCircle className="size-10 text-primary dark:text-accent-teal" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Help Center
          </h1>
          <p className="max-w-xl text-sm text-foreground-secondary sm:text-base">
            Everything you need to use CSIS SmartAssist: Sign-in, Chat, Room
            Bookings, and Admin Tools.
          </p>
        </div>

        <div className="mb-14 grid gap-4 sm:grid-cols-2">
          <Link href="/login">
            <Card className="h-full rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-background-secondary dark:hover:border-accent-teal/40">
              <LogIn className="mb-2 size-5 text-primary dark:text-accent-teal" />
              <h3 className="font-semibold text-foreground">Sign In</h3>
              <p className="mt-1 text-xs text-foreground-muted">
                Student or Admin Login
              </p>
            </Card>
          </Link>
          <Link href="/dashboard">
            <Card className="h-full rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-background-secondary dark:hover:border-accent-teal/40">
              <LayoutDashboard className="mb-2 size-5 text-primary dark:text-accent-teal" />
              <h3 className="font-semibold text-foreground">Dashboard</h3>
              <p className="mt-1 text-xs text-foreground-muted">
                Overview and Quick Actions
              </p>
            </Card>
          </Link>
          <Link href="/chat">
            <Card className="h-full rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-background-secondary dark:hover:border-accent-teal/40">
              <MessageSquare className="mb-2 size-5 text-primary dark:text-accent-teal" />
              <h3 className="font-semibold text-foreground">Chat</h3>
              <p className="mt-1 text-xs text-foreground-muted">
                Ask Smart Assist anything
              </p>
            </Card>
          </Link>
          <Link href="/bookings">
            <Card className="h-full rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-background-secondary dark:hover:border-accent-teal/40">
              <Calendar className="mb-2 size-5 text-primary dark:text-accent-teal" />
              <h3 className="font-semibold text-foreground">Bookings</h3>
              <p className="mt-1 text-xs text-foreground-muted">
                Reserve Rooms and Resources
              </p>
            </Card>
          </Link>
        </div>

        <div className="space-y-10">
          <Section icon={LogIn} title="Getting Started: Sign In">
            <p>
              SmartAssist uses Google sign-in restricted to{" "}
              <strong className="text-foreground">
                @goa.bits-pilani.ac.in
              </strong>
              .
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-foreground">Students:</strong> Choose
                &quot;Sign in with Google&quot; (student option). Use your BITS
                Goa email. You&apos;ll land on the dashboard after sign-in.
              </li>
              <li>
                <strong className="text-foreground">Admins:</strong> Choose the
                admin option, enter the admin key, then sign in with Google
                (BITS mail). You&apos;ll be taken to the admin area.
              </li>
            </ul>
            <p>
              If you see an error that you must use the other option (student vs
              admin), your account is already registered with that role — use
              the correct sign-in path.
            </p>
          </Section>

          <Section icon={Bot} title="Smart Assist chat">
            <p>
              From{" "}
              <Link
                href="/chat"
                className="text-primary underline underline-offset-2 hover:no-underline dark:text-accent-teal"
              >
                Chat
              </Link>{" "}
              you can ask questions about courses, policies, and campus info.
              Answers are grounded in uploaded documents (RAG).
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-foreground">New chat:</strong> Go to
                &quot;Chat&quot; and type; the first message creates a new
                conversation and the URL updates to /chat/c/[id].
              </li>
              <li>
                <strong className="text-foreground">Your chats:</strong> In the
                sidebar, use &quot;Your chats&quot; to open past conversations.
                You can search, rename, pin, or delete chats from the three-dot
                menu.
              </li>
              <li>
                <strong className="text-foreground">Voice:</strong> Use the mic
                button to speak; your words appear in the input for sending.
              </li>
              <li>
                <strong className="text-foreground">Export:</strong> Use the
                top-right menu and &quot;Export chat as PDF&quot; to download
                the conversation.
              </li>
            </ul>
          </Section>

          <Section icon={Calendar} title="Bookings">
            <p>
              The{" "}
              <Link
                href="/bookings"
                className="text-primary underline underline-offset-2 hover:no-underline dark:text-accent-teal"
              >
                Bookings
              </Link>{" "}
              page shows available rooms and resources. Filter by block (D, A,
              C), pick a room, and submit a booking request.
            </p>
            <p>
              Your booking status (e.g. Pending, Confirmed) appears on the
              dashboard and in the bookings list. Admins approve or reject
              requests; approved bookings can be synced to Google Calendar and
              you may receive an email confirmation.
            </p>
          </Section>

          <Section icon={LayoutDashboard} title="Dashboard">
            <p>
              After sign-in, the dashboard gives you a quick overview: recent
              Q&amp;A, upcoming bookings, and shortcuts to start a new chat or
              make a booking. Use the sidebar to switch between Dashboard, Chat,
              and Bookings. Notifications and settings are available from the
              header and sidebar.
            </p>
          </Section>

          <Section icon={Shield} title="For admins">
            <p>
              Admins get access to the admin area: approve or reject room
              bookings, upload documents to the AI knowledge base, and sync a
              Google Drive folder (manual trigger or daily via Inngest). Ensure
              you sign in with the{" "}
              <strong className="text-foreground">admin</strong> option and the
              correct admin key.
            </p>
          </Section>
        </div>

        <div className="mt-14">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <BookOpen className="size-5 text-primary dark:text-accent-teal" />
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            <FaqItem
              question="Why can't I sign in with my personal Gmail?"
              answer={
                <>
                  SmartAssist only allows{" "}
                  <strong>@goa.bits-pilani.ac.in</strong> accounts for security
                  and to keep the service for BITS Goa CS students and staff.
                </>
              }
            />
            <FaqItem
              question="I'm a student but the app says to use admin login."
              answer={
                <>
                  Your account is registered as an admin. Use the
                  &quot;Admin&quot; sign-in option with the admin key. If you
                  believe this is wrong, contact your department admin.
                </>
              }
            />
            <FaqItem
              question="Where do chat conversations get stored?"
              answer={
                <>
                  Chats are stored in the database and tied to your account. You
                  can see them under &quot;Your chats&quot; in the sidebar when
                  you&apos;re on the Chat page. You can rename, pin, or delete
                  them.
                </>
              }
            />
            <FaqItem
              question="How do I export a chat?"
              answer={
                <>
                  Open the chat, click the three-dot menu (⋮) in the top-right,
                  and choose &quot;Export chat as PDF&quot;. A PDF will download
                  with the conversation.
                </>
              }
            />
            <FaqItem
              question="My booking is pending. What happens next?"
              answer={
                <>
                  An admin will review your request. You&apos;ll see the status
                  on the dashboard and bookings page. If approved, it may be
                  added to Google Calendar and you may get an email.
                </>
              }
            />
            <FaqItem
              question="Can I use voice input in the chat?"
              answer={
                <>
                  Yes. Click the microphone icon next to the input. When it
                  turns red and pulses, speak; your words will be transcribed
                  into the text field. Then send as usual. Voice works in
                  supported browsers (Chrome, Edge, Safari).
                </>
              }
            />
            <FaqItem
              question="Who can access the admin panel?"
              answer={
                <>
                  Only users who signed in via the <strong>Admin</strong> option
                  with the correct admin secret key. Students cannot access
                  admin features even if they have the key — the system checks
                  your role.
                </>
              }
            />
          </div>
        </div>

        <Card className="mt-14 flex flex-col items-center gap-3 rounded-xl border border-border bg-background-secondary p-6 text-center dark:border-border-strong">
          <FileText className="size-8 text-primary dark:text-accent-teal" />
          <h3 className="font-semibold text-foreground">Need more help?</h3>
          <p className="text-sm text-foreground-secondary">
            For technical issues, feature requests, or access problems, contact
            your department or CSIS support. Include your BITS email and a short
            description of the issue.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline dark:text-accent-teal"
          >
            <Mail className="size-4" />
            {SUPPORT_EMAIL}
          </a>
        </Card>
      </div>
    </main>

    <LandingFooter />
  </div>
);

export default HelpPage;
