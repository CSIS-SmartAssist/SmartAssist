// Pending bookings + approve/reject buttons (Saksham)

type Booking = {
  id: string;
  requester: string;
  room: string;
  time: string;
  reason: string;
};

type Props = {
  bookings: Booking[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export const BookingsTable = ({ bookings, onApprove, onReject }: Props) => {
  if (bookings.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No pending bookings.</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Requester</th>
            <th className="text-left">Room</th>
            <th className="text-left">Time</th>
            <th className="text-left">Reason</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td>{b.requester}</td>
              <td>{b.room}</td>
              <td>{b.time}</td>
              <td>{b.reason}</td>
              <td>
                <button type="button" onClick={() => onApprove(b.id)}>
                  Approve
                </button>
                <button type="button" onClick={() => onReject(b.id)}>
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
