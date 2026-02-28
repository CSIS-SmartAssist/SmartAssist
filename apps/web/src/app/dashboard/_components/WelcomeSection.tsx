interface WelcomeSectionProps {
  userName: string;
  subtitle?: string;
}

export const WelcomeSection = ({
  userName,
  subtitle = "Here's what's happening on campus today.",
}: WelcomeSectionProps) => {
  const firstName = userName?.split(" ")[0] ?? "there";
  return (
    <section className="mb-6 md:mb-8">
      <h2 className="text-2xl font-bold text-foreground md:text-3xl">
        Welcome back, {firstName}! 👋
      </h2>
      <p className="mt-1 text-foreground-secondary">{subtitle}</p>
    </section>
  );
};
