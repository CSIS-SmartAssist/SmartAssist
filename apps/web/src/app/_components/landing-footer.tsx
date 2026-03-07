import Link from "next/link";
import { SmartAssistLogo, GitHubIcon } from "./landing-icons";

const GITHUB_URL = "https://github.com/CSIS-SmartAssist/SmartAssist";

const LINK_GROUPS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Integrations", href: "#" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
] as const;

export const LandingFooter = () => (
  <footer className="border-t border-border bg-background-secondary px-5 pt-12 pb-6 sm:px-8 lg:px-16">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="mb-3 flex items-center gap-2">
            <SmartAssistLogo />
            <span className="text-sm font-bold text-foreground">
              CSIS SmartAssist
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-foreground-muted">
            Simplifying campus life one interaction at a time with intelligent
            automation and seamless resource management.
          </p>
        </div>

        {LINK_GROUPS.map((group) => (
          <div key={group.heading}>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
              {group.heading}
            </h4>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
        <p className="text-xs text-foreground-muted">
          &copy; {new Date().getFullYear()} Campus Simplified. All rights
          reserved.
        </p>
        <div className="flex items-center gap-4">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-foreground-muted transition-colors hover:text-foreground"
          >
            <GitHubIcon />
          </a>
        </div>
      </div>
    </div>
  </footer>
);
