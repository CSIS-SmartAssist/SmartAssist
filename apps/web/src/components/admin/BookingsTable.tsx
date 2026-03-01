import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type AdminBooking = {
  id: string;
  requesterName: string;
  requesterEmail: string;
  roomName: string;
  roomLocation: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

type Props = {
  bookings: AdminBooking[];
  isLoading?: boolean;
  actionLoadingId?: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

const formatTimeRange = (startIso: string, endIso: string) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return `${start.toLocaleString()} - ${end.toLocaleString()}`;
};

export const BookingsTable = ({
  bookings,
  isLoading = false,
  actionLoadingId = null,
  onApprove,
  onReject,
}: Props) => {
  if (isLoading) {
    return <p className="text-sm text-foreground-secondary">Loading bookings...</p>;
  }

  if (bookings.length === 0) {
    return <p className="text-sm text-foreground-secondary">No pending bookings.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Requester</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => {
          const isMutating = actionLoadingId === booking.id;
          return (
            <TableRow key={booking.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{booking.requesterName}</span>
                  <span className="text-xs text-foreground-muted">{booking.requesterEmail}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{booking.roomName}</span>
                  <span className="text-xs text-foreground-muted">{booking.roomLocation}</span>
                </div>
              </TableCell>
              <TableCell className="max-w-sm whitespace-normal text-sm text-foreground-secondary">
                {formatTimeRange(booking.startTime, booking.endTime)}
              </TableCell>
              <TableCell className="max-w-sm whitespace-normal text-sm text-foreground-secondary">
                {booking.reason}
              </TableCell>
              <TableCell>
                <Badge
                  variant={booking.status === "PENDING" ? "secondary" : booking.status === "APPROVED" ? "default" : "destructive"}
                >
                  {booking.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    onClick={() => onApprove(booking.id)}
                    disabled={isMutating || booking.status !== "PENDING"}
                  >
                    {isMutating ? "Updating..." : "Approve"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(booking.id)}
                    disabled={isMutating || booking.status !== "PENDING"}
                  >
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
