import type { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="feature-card-glow rounded-xl border border-border bg-background-secondary p-4 dark:border-border-strong dark:hover:border-accent-teal/30">
    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-muted text-primary dark:bg-accent-teal/10 dark:text-accent-teal">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    <p className="mt-1 text-xs leading-relaxed text-foreground-secondary">
      {description}
    </p>
  </div>
);
