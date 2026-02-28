import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import type { DashboardUser } from "./_types";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user: DashboardUser = {
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  // TODO: notificationCount can be fetched from API or context when needed
  return (
    <DashboardLayout user={user} notificationCount={2}>
      {children}
    </DashboardLayout>
  );
}
