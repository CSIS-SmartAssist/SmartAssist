import Link from "next/link";
import { SmartAssistLogo, TwitterIcon, GitHubIcon } from "./landing-icons";

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
      { label: "Documentation", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
] as const;

export const LandingFooter = () => (
  <footer className="border-t border-border bg-background-secondary px-5 pt-12 pb-6 sm:px-8 lg:px-16">
    <div className="mx-auto max-w-7xl">
      {/* Top grid */}
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand column */}
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

        {/* Link columns */}
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

      {/* Bottom bar */}
      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
        <p className="text-xs text-foreground-muted">
          &copy; {new Date().getFullYear()} Campus Simplified. All rights
          reserved.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="#"
            aria-label="Twitter"
            className="text-foreground-muted transition-colors hover:text-foreground"
          >
            <TwitterIcon />
          </a>
          <a
            href="#"
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
