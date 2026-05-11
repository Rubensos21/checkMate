import { cookies } from "next/headers";
import { UsersClient } from "@/components/users/UsersClient";
import { redirect } from "next/navigation";

export const metadata = { title: "Gestión de Usuarios | Dynamic Cooperation Group" };
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("userRole")?.value;

  if (role !== "ADMIN") redirect("/");

  let users = [];
  try {
    const res = await fetch("http://localhost:3001/api/users", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    if (Array.isArray(data)) users = data;
  } catch {
    // pass - will show empty state
  }

  return <UsersClient initialUsers={users} token={token!} />;
}
