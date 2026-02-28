import { FlaskIcon, BookIcon, TrophyIcon, PaletteIcon } from "./landing-icons";

const DEPARTMENTS = [
  { icon: FlaskIcon, label: "Science Dept", color: "text-accent-teal" },
  { icon: BookIcon, label: "Library Services", color: "text-primary" },
  { icon: TrophyIcon, label: "Athletics", color: "text-accent-green" },
  { icon: PaletteIcon, label: "Arts Center", color: "text-accent-orange" },
] as const;

export const LandingDepartments = () => (
  <section className="border-y border-border px-5 py-12 sm:px-8 lg:px-16">
    <div className="mx-auto max-w-5xl text-center">
      <p className="mb-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground-muted">
        Trusted by departments across campus
      </p>

      <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
        {DEPARTMENTS.map((d) => (
          <div
            key={d.label}
            className="flex items-center gap-2 text-foreground-secondary"
          >
            <d.icon className={d.color} />
            <span className="text-sm font-medium">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);
