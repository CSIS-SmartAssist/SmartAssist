import type { ReactNode } from "react";

export interface DashboardUser {
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface RecentQAItem {
  question: string;
  answer: string;
}

export interface UpcomingBookingItem {
  id: string;
  date: Date;
  title: string;
  location: string;
  timeRange: string;
  status: "CONFIRMED" | "APPROVED" | "PENDING" | "REJECTED";
}

export interface ActionCardProps {
  title: string;
  description: string;
  href?: string;
  buttonLabel: string;
  icon: ReactNode;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "success" | "warning" | "outline";
}
