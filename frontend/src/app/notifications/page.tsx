import { cookies } from "next/headers";
import NotificationsClient from "./NotificationsClient";

export const metadata = {
  title: "Notificaciones | Dynamic Cooperation Group",
};
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const role = cookieStore.get("userRole")?.value || "";

  // Fetch initial notifications server-side
  const res = await fetch("http://localhost:3001/api/export/notifications", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const notifications = res.ok ? await res.json() : [];

  return <NotificationsClient initialNotifications={notifications} token={token} role={role} />;
}
