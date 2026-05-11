import { cookies } from "next/headers";
import { CustomizationClient } from "@/components/customization/CustomizationClient";
import { redirect } from "next/navigation";

export const metadata = { title: "Personalización | Dynamic Cooperation Group" };
export const dynamic = 'force-dynamic';

export default async function CustomizationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("userRole")?.value;

  if (role !== "ADMIN") redirect("/");

  let settings = { theme: "dark", primaryColor: "indigo" };
  try {
    const res = await fetch("http://localhost:3001/api/settings", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.theme) settings = data;
    }
  } catch { /* pass */ }

  return <CustomizationClient initialSettings={settings} token={token!} />;
}
