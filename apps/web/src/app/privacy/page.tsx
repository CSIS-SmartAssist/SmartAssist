import Link from "next/link";
import { ArrowLeft, Shield, Database, Cookie, Mail, Lock } from "lucide-react";
import { LandingFooter } from "../_components/landing-footer";

const LegalSection = ({
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

const PrivacyPage = () => (
  <div className="flex min-h-screen flex-col bg-background font-sans">
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-transparent p-2 text-sm font-medium text-foreground-secondary transition-colors hover:border-primary hover:text-foreground dark:hover:border-accent-teal"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to home
        </Link>

        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary/10 p-3 dark:bg-accent-teal/10">
            <Shield className="size-10 text-primary dark:text-accent-teal" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-foreground-muted">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="space-y-10">
          <LegalSection icon={Shield} title="Introduction">
            <p>
              CSIS SmartAssist (&quot;we&quot;, &quot;Service&quot;) is
              committed to protecting your privacy. This policy describes how we
              collect, use, and safeguard information when you use our Service.
              The Service is provided for the BITS Pilani – Goa Campus, CS
              department, and is intended for users with a valid{" "}
              <strong className="text-foreground">
                @goa.bits-pilani.ac.in
              </strong>{" "}
              account.
            </p>
          </LegalSection>

          <LegalSection icon={Database} title="Information we collect">
            <p>
              We collect and process the following in connection with the
              Service:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-foreground">Account data:</strong> When
                you sign in with Google, we receive your name, email address,
                and profile image from Google, limited to the data Google
                provides. We use this to identify you and to assign roles
                (student or admin).
              </li>
              <li>
                <strong className="text-foreground">Chat data:</strong> Messages
                you send and receive in Smart Assist are stored so we can
                maintain conversation history and improve the service. This data
                is associated with your account.
              </li>
              <li>
                <strong className="text-foreground">Booking data:</strong> Room
                and resource booking requests, times, and status (e.g. pending,
                confirmed) are stored and may be used for calendar integration
                and notifications.
              </li>
              <li>
                <strong className="text-foreground">Usage data:</strong> We may
                collect technical information such as IP address, browser type,
                and access times for security, rate limiting, and operational
                purposes.
              </li>
            </ul>
          </LegalSection>

          <LegalSection icon={Lock} title="How we use your information">
            <p>
              We use the information above to: provide and operate the Service;
              authenticate you and enforce access rules; store and display your
              chats and bookings; send booking confirmations or administrative
              emails where configured; protect against abuse and comply with
              legal obligations. We do not sell your personal data. Data may be
              processed by trusted service providers (e.g. hosting, database,
              email) under appropriate agreements.
            </p>
          </LegalSection>

          <LegalSection icon={Cookie} title="Cookies and similar technologies">
            <p>
              We use cookies and similar technologies to provide and secure the
              Service:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-foreground">Strictly necessary:</strong>{" "}
                Session and authentication cookies (e.g. NextAuth) are required
                for sign-in and to keep you logged in. These cannot be disabled
                if you wish to use the Service.
              </li>
              <li>
                <strong className="text-foreground">Preferences:</strong> We may
                store your theme choice (light/dark) so it persists across
                visits.
              </li>
              <li>
                <strong className="text-foreground">
                  Security and performance:
                </strong>{" "}
                We may use cookies or similar means for rate limiting, bot
                detection, and protecting the Service.
              </li>
            </ul>
            <p>
              We do not use third-party advertising cookies. You can control or
              delete cookies through your browser settings; disabling essential
              cookies may prevent you from using the Service.
            </p>
          </LegalSection>

          <LegalSection icon={Database} title="Data retention and security">
            <p>
              We retain your account, chat, and booking data for as long as your
              account exists and as needed for the Service. You can delete
              individual chats from the Chat interface. We implement appropriate
              technical and organisational measures to protect your data against
              unauthorised access, loss, or alteration. Data is stored in
              secure, access-controlled environments.
            </p>
          </LegalSection>

          <LegalSection icon={Mail} title="Your rights and contact">
            <p>
              Depending on applicable law, you may have the right to access,
              correct, or delete your personal data, or to object to or restrict
              certain processing. To exercise these rights or for any
              privacy-related questions, contact your department administrator
              or the service operators at your institution. If the Service is
              provided under the authority of your institution, their policies
              may also apply.
            </p>
          </LegalSection>
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-border pt-8 dark:border-border-strong">
          <Link
            href="/terms"
            className="text-sm font-medium text-primary hover:underline dark:text-accent-teal"
          >
            Terms of Service
          </Link>
          <Link
            href="/help"
            className="text-sm font-medium text-foreground-secondary hover:text-foreground"
          >
            Help Center
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-foreground-secondary hover:text-foreground"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
    <LandingFooter />
  </div>
);

export default PrivacyPage;
