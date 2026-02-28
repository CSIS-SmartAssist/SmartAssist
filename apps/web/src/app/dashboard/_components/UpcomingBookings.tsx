import Link from "next/link";
import { Calendar } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UpcomingBookingItem } from "../_types";
import {
  formatBookingDateShort,
  getBookingStatusVariant,
  getBookingStatusLabel,
} from "../_utils";

interface UpcomingBookingsProps {
  bookings: UpcomingBookingItem[];
}

export const UpcomingBookings = ({ bookings }: UpcomingBookingsProps) => {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="size-5 text-foreground-secondary" aria-hidden />
          Upcoming Bookings
        </CardTitle>
        <CardAction>
          <Link
            href="/bookings"
            className="text-sm font-medium text-primary hover:underline"
          >
            Calendar
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {bookings.length === 0 ? (
          <p className="text-sm text-foreground-muted">No upcoming bookings.</p>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => (
              <li key={b.id} className="flex gap-4">
                <div className="flex shrink-0 flex-col items-center rounded-lg bg-background-secondary px-2 py-1.5 text-center">
                  <span className="text-xs font-semibold uppercase leading-tight text-foreground-secondary">
                    {formatBookingDateShort(b.date)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{b.title}</p>
                  <p className="text-sm text-foreground-secondary">
                    {b.location} • {b.timeRange}
                  </p>
                  <Badge
                    variant={getBookingStatusVariant(b.status)}
                    className="mt-1.5"
                  >
                    {getBookingStatusLabel(b.status)}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
