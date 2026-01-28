// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("argos_session")?.value;

  if (!sessionId) redirect("/login");

  // Obtener el usuario para verificar su rol
  const user = await prisma.user.findUnique({
    where: { id: parseInt(sessionId) },
  });

  if (!user) redirect("/login");

  // Redirigir según el rol
  if (user.role === "MANAGER") {
    redirect("/dashboard/manager");
  } else {
    redirect("/dashboard/worker");
  }
}
