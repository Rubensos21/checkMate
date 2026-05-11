import { cookies } from "next/headers";
import { CoursesClient } from "@/components/courses/CoursesClient";

export const metadata = { title: "Cursos | Dynamic Cooperation Group" };
export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("userRole")?.value || "STUDENT";
  const userId = cookieStore.get("userId")?.value || "";

  let courses = [];
  let teachers = [];

  try {
    const res = await fetch("http://localhost:3001/api/courses", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    if (Array.isArray(data)) courses = data;
  } catch { /* pass */ }

  if (role === "ADMIN") {
    try {
      const res = await fetch("http://localhost:3001/api/users?role=TEACHER", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data)) teachers = data;
    } catch { /* pass */ }
  }

  return (
    <CoursesClient
      initialCourses={courses}
      teachers={teachers}
      token={token!}
      userRole={role}
      userId={userId}
    />
  );
}
