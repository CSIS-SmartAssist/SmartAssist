"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BookingsTable, type AdminBooking } from "@/components/admin/BookingsTable";
import * as logger from "@/lib/logger";

type ApiBooking = {
  id: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: { name: string; email: string };
  room: { name: string; location: string };
};

const mapBooking = (booking: ApiBooking): AdminBooking => ({
  id: booking.id,
  requesterName: booking.user.name,
  requesterEmail: booking.user.email,
  roomName: booking.room.name,
  roomLocation: booking.room.location,
  startTime: booking.startTime,
  endTime: booking.endTime,
  reason: booking.reason,
  status: booking.status,
});

export default function AdminBookingsPage() {
  const [pendingBookings, setPendingBookings] = useState<AdminBooking[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadPendingBookings = useCallback(async () => {
    try {
      setIsLoadingPending(true);
      const response = await fetch("/api/admin/bookings?status=PENDING", { method: "GET" });
      const payload = (await response.json()) as ApiBooking[] | { error?: string };

      if (!response.ok || !Array.isArray(payload)) {
        throw new Error((payload as { error?: string }).error ?? "Failed to fetch pending bookings");
      }

      setPendingBookings(payload.map(mapBooking));
    } catch (error) {
      logger.error("AdminBookingsPage.loadPendingBookings", {
        message: error instanceof Error ? error.message : String(error),
      });
      setErrorMessage(error instanceof Error ? error.message : "Failed to fetch pending bookings");
    } finally {
      setIsLoadingPending(false);
    }
  }, []);

  const mutateBooking = async (id: string, action: "approve" | "reject") => {
    try {
      setActionLoadingId(id);
      const response = await fetch(`/api/admin/${action}/${id}`, { method: "POST" });
      const payload = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? `Failed to ${action} booking`);
      }

      await loadPendingBookings();
    } catch (error) {
      logger.error("AdminBookingsPage.mutateBooking", {
        action,
        bookingId: id,
        message: error instanceof Error ? error.message : String(error),
      });
      setErrorMessage(error instanceof Error ? error.message : `Failed to ${action} booking`);
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    void loadPendingBookings();
  }, [loadPendingBookings]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-background/90 px-8 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <p className="text-lg font-bold tracking-tight">Smart Assist</p>
            <div className="flex gap-8 text-sm">
              <Link href="/admin" className="text-foreground-secondary hover:text-foreground">Dashboard</Link>
              <span className="border-b-2 border-primary pb-1 font-semibold text-primary">Resource Booking</span>
              <Link href="/admin/documents" className="text-foreground-secondary hover:text-foreground">Documents</Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" className="rounded-2xl" onClick={() => void loadPendingBookings()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-8 py-8">
        <h1 className="text-5xl font-bold tracking-tight">Resource Booking</h1>
        <p className="mt-3 max-w-2xl text-lg text-foreground-secondary">
          Welcome back, admin. Manage academic spaces and review pending room requests.
        </p>

        {errorMessage ? <p className="mt-4 text-sm text-red-400">{errorMessage}</p> : null}

        <Card className="mt-6 rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">Pending Admin Actions</h2>
          <p className="mt-1 text-sm text-foreground-secondary">Approve or reject pending booking requests.</p>
          <div className="mt-4">
            <BookingsTable
              bookings={pendingBookings}
              isLoading={isLoadingPending}
              actionLoadingId={actionLoadingId}
              onApprove={(id) => void mutateBooking(id, "approve")}
              onReject={(id) => void mutateBooking(id, "reject")}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
