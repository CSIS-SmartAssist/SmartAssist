import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Scale,
  UserCheck,
  Shield,
  AlertCircle,
} from "lucide-react";
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

const TermsPage = () => (
  <div className="flex min-h-screen flex-col bg-background font-sans">
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-transparent p-2 text-sm font-medium text-foreground-secondary transition-colors hover:border-primary hover:text-foreground dark:hover:border-accent-teal"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Go back
        </Link>

        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary/10 p-3 dark:bg-accent-teal/10">
            <Scale className="size-10 text-primary dark:text-accent-teal" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Terms of Service
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
          <LegalSection icon={FileText} title="Agreement">
            <p>
              Welcome to CSIS SmartAssist (&quot;Service&quot;). By accessing or
              using this Service, you agree to be bound by these Terms of
              Service. The Service is operated for the BITS Pilani – Goa Campus,
              CS department, and is intended for use by students and authorised
              staff with a valid{" "}
              <strong className="text-foreground">
                @goa.bits-pilani.ac.in
              </strong>{" "}
              account.
            </p>
          </LegalSection>

          <LegalSection icon={UserCheck} title="Eligibility and accounts">
            <p>
              You must use a Google account with an email ending in{" "}
              <strong className="text-foreground">
                @goa.bits-pilani.ac.in
              </strong>{" "}
              to sign in. You are responsible for keeping your account secure
              and for all activity under your account. Student and admin roles
              are assigned by the system; you must use the correct sign-in
              option (student or admin with key) for your role. Misuse of admin
              access or impersonation is prohibited.
            </p>
          </LegalSection>

          <LegalSection icon={Shield} title="Acceptable use">
            <p>
              You agree to use the Service only for lawful purposes related to
              campus activities: asking questions about courses and policies,
              booking rooms and resources, and (if you are an admin) managing
              bookings and content. You must not:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>
                Attempt to gain unauthorised access to systems, data, or other
                accounts
              </li>
              <li>
                Upload or share malicious content or violate intellectual
                property rights
              </li>
              <li>Circumvent security, rate limits, or access controls</li>
              <li>
                Use the Service for commercial purposes without permission
              </li>
            </ul>
            <p>
              We may suspend or terminate access for violations of these terms
              or for any conduct that we reasonably consider harmful to the
              Service or its users.
            </p>
          </LegalSection>

          <LegalSection icon={FileText} title="Service description">
            <p>
              The Service provides an AI-powered chatbot (Smart Assist) that
              answers questions using institutional documents, and a
              room-booking system. Chat conversations and booking data are
              stored and processed as described in our Privacy Policy. We strive
              for availability but do not guarantee uninterrupted access; the
              Service may be modified, suspended, or discontinued with
              reasonable notice where possible.
            </p>
          </LegalSection>

          <LegalSection icon={AlertCircle} title="Disclaimer">
            <p>
              AI-generated answers are for general guidance only and may not be
              complete or up to date. Always verify important academic or
              administrative information through official channels. The Service
              is provided &quot;as is&quot; to the extent permitted by law; we
              disclaim warranties of merchantability, fitness for a particular
              purpose, and non-infringement. We are not liable for indirect,
              incidental, or consequential damages arising from your use of the
              Service.
            </p>
          </LegalSection>

          <LegalSection icon={FileText} title="Changes and contact">
            <p>
              We may update these Terms from time to time. Continued use of the
              Service after changes constitutes acceptance. For questions about
              these Terms, contact your department or the service administrators
              at your institution.
            </p>
          </LegalSection>
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-border pt-8 dark:border-border-strong">
          <Link
            href="/privacy"
            className="text-sm font-medium text-primary hover:underline dark:text-accent-teal"
          >
            Privacy Policy
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

export default TermsPage;
