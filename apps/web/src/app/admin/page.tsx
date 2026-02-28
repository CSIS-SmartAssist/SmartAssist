// Admin root — redirect or tabs: Bookings | Documents (Saksham)

import Link from "next/link";

const AdminPage = () => (
  <div className="flex flex-col gap-4 p-4">
    <h1 className="text-xl font-semibold">Admin Dashboard</h1>
    <nav className="flex gap-4">
      <Link href="/admin/bookings" className="underline">
        Bookings
      </Link>
      <Link href="/admin/documents" className="underline">
        Documents
      </Link>
    </nav>
  </div>
);

export default AdminPage;
