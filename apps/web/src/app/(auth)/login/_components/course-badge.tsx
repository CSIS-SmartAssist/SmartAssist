interface CourseBadgeProps {
  color: "green" | "teal" | "orange";
  label: string;
}

const DOT_COLORS = {
  green: "bg-accent-green",
  teal: "bg-accent-teal",
  orange: "bg-accent-orange",
} as const;

export const CourseBadge = ({ color, label }: CourseBadgeProps) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-secondary px-3 py-1 text-[11px] font-medium text-foreground-secondary">
    <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[color]}`} />
    {label}
  </span>
);
