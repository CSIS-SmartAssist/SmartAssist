export const SmartAssistLogo = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 32 32"
    fill="none"
    className="text-primary dark:text-accent-teal"
  >
    <circle
      cx="16"
      cy="16"
      r="14"
      stroke="currentColor"
      strokeWidth="2"
      fill="currentColor"
      fillOpacity="0.1"
    />
    <circle cx="16" cy="11" r="2.5" fill="currentColor" />
    <circle cx="10" cy="19" r="2.5" fill="currentColor" />
    <circle cx="22" cy="19" r="2.5" fill="currentColor" />
    <line
      x1="16"
      y1="13.5"
      x2="10"
      y2="16.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <line
      x1="16"
      y1="13.5"
      x2="22"
      y2="16.5"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <line
      x1="10"
      y1="19"
      x2="22"
      y2="19"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

export const RoutingIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12h4l3-9 4 18 3-9h4" />
  </svg>
);

export const SyncIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 014-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
);

export const KeyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

export const GoogleColorIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09A6.56 6.56 0 015.5 12c0-.72.13-1.43.35-2.09V7.07H2.18A11.01 11.01 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);
