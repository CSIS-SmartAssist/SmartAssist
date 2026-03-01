import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Bolt, CalendarClock, Database, Layers3, MapPin, School } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const StatCard = ({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) => (
  <Card className="rounded-3xl border border-border bg-card p-5 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm text-foreground-secondary">{title}</p>
      <span className="text-primary">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-foreground">{value}</p>
    <p className="mt-1 text-xs text-foreground-muted">{hint}</p>
  </Card>
);

export default async function AdminPage() {
  const [pendingBookings, doneDocuments, failedDocuments, totalRooms, nextSession] = await Promise.all([
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.document.count({ where: { ingestionStatus: "DONE" } }),
    prisma.document.count({ where: { ingestionStatus: "FAILED" } }),
    prisma.room.count(),
    prisma.booking.findFirst({
      where: { status: "APPROVED", startTime: { gt: new Date() } },
      include: { room: true },
      orderBy: { startTime: "asc" },
    }),
  ]);

  const activeApproved = await prisma.booking.count({
    where: { status: "APPROVED", startTime: { lte: new Date() }, endTime: { gt: new Date() } },
  });
  const availableRooms = Math.max(totalRooms - activeApproved, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-background/90 px-8 py-4">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
              <School className="size-5 text-primary" />
            </div>
            <p className="text-xl font-bold tracking-tight">SMART ASSIST</p>
            <Badge className="bg-primary/15 text-primary">Admin Dashboard</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="text-foreground-secondary hover:text-foreground">
              <Link href="/admin/bookings">Bookings</Link>
            </Button>
            <Button asChild variant="ghost" className="text-foreground-secondary hover:text-foreground">
              <Link href="/admin/documents">Documents</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-8 py-8 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit rounded-3xl border border-border bg-card p-4">
          <p className="mb-3 text-xs tracking-[0.2em] text-foreground-muted">MENU</p>
          <div className="space-y-2">
            <Button className="w-full justify-start rounded-2xl bg-primary/15 text-primary hover:bg-primary/20">
              <Layers3 className="size-4" />
              Overview
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start rounded-2xl text-foreground-secondary hover:text-foreground">
              <Link href="/admin/bookings">Room Finder</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-start rounded-2xl text-foreground-secondary hover:text-foreground">
              <Link href="/admin/documents">Resources</Link>
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">Welcome, Admin</h1>
            <p className="mt-2 text-lg text-foreground-secondary">Your academic command center is live.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Available Rooms" value={String(availableRooms)} hint={`${totalRooms} total rooms`} icon={<MapPin className="size-4" />} />
            <StatCard title="Pending Requests" value={String(pendingBookings)} hint="Awaiting admin action" icon={<CalendarClock className="size-4" />} />
            <StatCard title="Indexed Documents" value={String(doneDocuments)} hint={`${failedDocuments} failed ingestions`} icon={<Database className="size-4" />} />
          </div>

          <Card className="rounded-3xl border border-primary/30 bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold text-primary">Next Session</p>
            <p className="mt-2 text-4xl font-bold text-foreground">
              {nextSession ? `${nextSession.room.name}` : "No upcoming session"}
            </p>
            <p className="mt-2 text-foreground-secondary">
              {nextSession
                ? `${new Date(nextSession.startTime).toLocaleString()} at ${nextSession.room.location}`
                : "No approved booking scheduled yet."}
            </p>
            <div className="mt-5">
              <Button asChild className="rounded-2xl bg-purple-600/70 px-6 hover:bg-purple-600">
                <Link href="/admin/bookings">
                  <Bolt className="size-4" />
                  Open Booking Console
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
