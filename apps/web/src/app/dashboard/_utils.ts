// Dashboard utilities — status variants, date formatting, etc.

export type BookingStatus = "PENDING" | "APPROVED" | "REJECTED" | "CONFIRMED";

export const getBookingStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
    case "APPROVED":
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED":
      return "destructive";
    default:
      return "outline";
  }
};

export const getBookingStatusLabel = (status: string): string => {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
    case "APPROVED":
      return "Confirmed";
    case "PENDING":
      return "Pending";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
};

/** Format date for upcoming bookings list e.g. "OCT 24" */
export const formatBookingDateShort = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }).toUpperCase();
};

/** Format time range e.g. "2:00 PM - 4:00 PM" */
export const formatTimeRange = (start: Date, end: Date): string => {
  const fmt = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  return `${fmt(start)} - ${fmt(end)}`;
};
