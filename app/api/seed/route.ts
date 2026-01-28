// app/api/seed/route.ts
// Este endpoint crea usuarios de prueba para desarrollo
import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/auth";

export async function GET() {
  try {
    // Crear un usuario jefe
    const managerEmail = "manager@argos.cl";
    let manager = await getUserByEmail(managerEmail);

    if (!manager) {
      manager = await createUser(
        managerEmail,
        "manager123",
        "Juan Manager",
        "MANAGER"
      );
    }

    // Crear un usuario trabajador
    const workerEmail = "worker@argos.cl";
    let worker = await getUserByEmail(workerEmail);

    if (!worker) {
      worker = await createUser(
        workerEmail,
        "worker123",
        "Carlos Worker",
        "WORKER"
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Users seeded successfully",
      users: [
        {
          email: manager.email,
          name: manager.name,
          role: manager.role,
        },
        {
          email: worker.email,
          name: worker.name,
          role: worker.role,
        },
      ],
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
