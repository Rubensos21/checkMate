import { cookies } from "next/headers";
import { SubmissionTable } from "@/components/dashboard/SubmissionTable";

export const metadata = {
  title: "Evaluar Entregas | Dynamic Cooperation Group",
};

export const dynamic = "force-dynamic";

export default async function GradesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const role = cookieStore.get("userRole")?.value || "STUDENT";

  let submissions = [];
  try {
    const res = await fetch("http://localhost:3001/api/submissions", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data)) submissions = data;
  } catch (error) {
    console.error("Error fetching submissions", error);
  }

  return (
    <div className="p-6 lg:p-10 w-full">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Evaluar Entregas</h2>
        <p className="text-neutral-400">
          Haz clic en cualquier entrega para abrirla, revisar el trabajo y calificar.
        </p>
      </header>
      <SubmissionTable data={submissions} token={token} role={role} />
    </div>
  );
}
