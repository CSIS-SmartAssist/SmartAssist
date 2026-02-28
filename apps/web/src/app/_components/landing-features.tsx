import { ChatBotIcon, CalendarIcon, ShieldIcon } from "./landing-icons";

/* ── Decorative mockup mini-UIs ── */

const RagMockup = () => (
  <div className="space-y-2 rounded-xl border border-border bg-background p-3 dark:border-border-strong">
    <div className="h-2 w-3/4 rounded-full bg-primary/20 dark:bg-accent-teal/20" />
    <div className="h-2 w-1/2 rounded-full bg-primary/15 dark:bg-accent-teal/15" />
    <div className="mt-3 flex gap-1.5">
      <div className="h-1.5 w-10 rounded-full bg-accent-teal/50" />
      <div className="h-1.5 w-14 rounded-full bg-primary/30" />
      <div className="h-1.5 w-8 rounded-full bg-accent-green/40" />
    </div>
  </div>
);

const BookingMockup = () => (
  <div className="rounded-xl border border-border bg-background p-3 dark:border-border-strong">
    <div className="grid grid-cols-5 gap-1.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`h-6 rounded ${
            [2, 5, 7].includes(i)
              ? "bg-primary/30 dark:bg-accent-teal/30"
              : [3, 8].includes(i)
                ? "bg-accent-orange/25"
                : "bg-background-tertiary"
          }`}
        />
      ))}
    </div>
  </div>
);

const AdminMockup = () => (
  <div className="space-y-2 rounded-xl border border-border bg-background p-3 dark:border-border-strong">
    <div className="flex items-center justify-between">
      <div className="h-2 w-20 rounded-full bg-foreground-muted/30" />
      <span className="rounded-full bg-accent-green/20 px-2 py-0.5 text-[9px] font-semibold text-accent-green">
        Approve
      </span>
    </div>
    <div className="flex items-center justify-between">
      <div className="h-2 w-24 rounded-full bg-foreground-muted/30" />
      <span className="rounded-full bg-accent-red/20 px-2 py-0.5 text-[9px] font-semibold text-accent-red">
        Reject
      </span>
    </div>
  </div>
);

/* ── Feature data ── */

const FEATURES = [
  {
    icon: ChatBotIcon,
    title: "Instant Answers (RAG)",
    description:
      "Ask questions about campus policies, schedules, or events. Our AI retrieves accurate information directly from official documents instantly.",
    mockup: <RagMockup />,
  },
  {
    icon: CalendarIcon,
    title: "Efficient Booking",
    description:
      "Reserve study rooms, labs, or equipment with a seamless calendar interface. Real-time availability checks prevent conflicts.",
    mockup: <BookingMockup />,
  },
  {
    icon: ShieldIcon,
    title: "Admin Oversight",
    description:
      "Administrators can easily review requests, manage users, and approve bookings with a comprehensive dashboard.",
    mockup: <AdminMockup />,
  },
] as const;

/* ── Section ── */

export const LandingFeatures = () => (
  <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-16">
    <div className="mx-auto max-w-7xl">
      {/* Heading */}
      <div className="mb-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Powerful Features
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground-secondary sm:text-base">
          Everything you need to manage your campus experience efficiently.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="neon-card flex flex-col rounded-2xl border border-border bg-background-secondary p-6 dark:border-border-strong"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-primary dark:bg-accent-teal/10 dark:text-accent-teal">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {f.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
              {f.description}
            </p>
            <div className="mt-auto pt-6">{f.mockup}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
