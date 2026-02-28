import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { Monitor, Calendar, Bell } from "lucide-react";
import { WelcomeSection } from "./_components/WelcomeSection";
import { ActionCard } from "./_components/ActionCard";
import { RecentQA } from "./_components/RecentQA";
import { UpcomingBookings } from "./_components/UpcomingBookings";
import { formatTimeRange } from "./_utils";
import type { RecentQAItem, UpcomingBookingItem } from "./_types";

export default async function DashboardPage() {
  const session = await getServerSession(authConfig);
  const userName = session?.user?.name ?? "Student";

  const recentQA: RecentQAItem[] = [
    {
      question: "How do I request a transcript?",
      answer:
        "To request an official transcript, log in to the student portal, navigate to the 'Academics' tab, and select 'Transcript Request'. Processing typically takes 2-3 business days.",
    },
    {
      question: "Library weekend hours?",
      answer:
        "The Main Library is open Saturdays from 10:00 AM to 6:00 PM and Sundays from 12:00 PM to 8:00 PM during the regular semester.",
    },
  ];

  const upcomingBookings: UpcomingBookingItem[] = [
    {
      id: "1",
      date: new Date(new Date().getFullYear(), 9, 24),
      title: "Study Room 304",
      location: "Library",
      timeRange: formatTimeRange(
        new Date(0, 0, 0, 14, 0),
        new Date(0, 0, 0, 16, 0),
      ),
      status: "CONFIRMED",
    },
    {
      id: "2",
      date: new Date(new Date().getFullYear(), 9, 26),
      title: "Chemistry Lab Station 4",
      location: "Science Building",
      timeRange: formatTimeRange(
        new Date(0, 0, 0, 9, 0),
        new Date(0, 0, 0, 11, 0),
      ),
      status: "PENDING",
    },
    {
      id: "3",
      date: new Date(new Date().getFullYear(), 9, 28),
      title: "Projector Set A",
      location: "Media Center",
      timeRange: formatTimeRange(
        new Date(0, 0, 0, 13, 0),
        new Date(0, 0, 0, 13, 30),
      ),
      status: "CONFIRMED",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <WelcomeSection userName={userName} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <ActionCard
          title="Ask AI Assistant"
          description="Get instant answers about courses & campus policies."
          href="/chat"
          buttonLabel="New Chat"
          icon={<Monitor className="size-6" />}
          badge="Active"
          badgeVariant="success"
        />
        <ActionCard
          title="Quick Booking"
          description="Reserve a study room or lab equipment instantly."
          href="/bookings"
          buttonLabel="Book Resource"
          icon={<Calendar className="size-6" />}
        />
        <ActionCard
          title="Notifications"
          description="Room 304 booking confirmed for tomorrow."
          href="/dashboard/notifications"
          buttonLabel="View All"
          icon={<Bell className="size-6" />}
          badge="2 New"
          badgeVariant="destructive"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentQA items={recentQA} />
        <UpcomingBookings bookings={upcomingBookings} />
      </div>
    </div>
  );
}
