import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import type { DashboardUser } from "@/app/dashboard/_types";

export default async function BookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    redirect("/login?callbackUrl=/bookings");
  }

  const user: DashboardUser = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  return (
    <DashboardLayout user={user} notificationCount={2} enableVisualEffects={false}>
      {children}
    </DashboardLayout>
  );
}
