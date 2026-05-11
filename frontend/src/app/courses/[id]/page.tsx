import { cookies } from "next/headers";
import { CourseDetailClient } from "@/components/courses/CourseDetailClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("userRole")?.value || "STUDENT";

  let course = null;
  let assignments = [];

  try {
    const [courseRes, assignRes] = await Promise.all([
      fetch(`http://localhost:3001/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`http://localhost:3001/api/courses/${id}/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);
    if (courseRes.ok) course = await courseRes.json();
    const aData = await assignRes.json();
    if (Array.isArray(aData)) assignments = aData;
  } catch { /* pass */ }

  if (!course) return notFound();

  return (
    <CourseDetailClient
      course={course}
      initialAssignments={assignments}
      token={token!}
      userRole={role}
    />
  );
}
