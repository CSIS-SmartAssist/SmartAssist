import { BookingForm } from "@/components/bookings/BookingForm";

const BookingsPage = () => (
  <div className="flex flex-col gap-4 p-4">
    <h1 className="text-xl font-semibold">Book a Room</h1>
    <BookingForm />
  </div>
);

export default BookingsPage;
