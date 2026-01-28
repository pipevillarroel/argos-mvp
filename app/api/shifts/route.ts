// app/api/shifts/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/shifts
 * Obtiene el turno activo del usuario (solo si es WORKER)
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("argos_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(sessionId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Obtener el turno activo (más reciente sin cerrar)
    const activeShift = await prisma.shift.findFirst({
      where: {
        userId: user.id,
        closed: false,
      },
      orderBy: { startTime: "desc" },
    });

    return NextResponse.json({
      ok: true,
      shift: activeShift || null,
    });
  } catch (error) {
    console.error("Get shift error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shift" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shifts
 * WORKER: Iniciar un nuevo turno
 */
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("argos_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(sessionId) },
    });

    if (!user || user.role !== "WORKER") {
      return NextResponse.json(
        { error: "Only workers can start shifts" },
        { status: 403 }
      );
    }

    // Verificar si hay un turno activo
    const existingShift = await prisma.shift.findFirst({
      where: {
        userId: user.id,
        closed: false,
      },
    });

    if (existingShift) {
      return NextResponse.json(
        { error: "You already have an active shift" },
        { status: 409 }
      );
    }

    // Crear nuevo turno
    const shift = await prisma.shift.create({
      data: {
        userId: user.id,
        startTime: new Date(),
        closed: false,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        shift,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create shift error:", error);
    return NextResponse.json(
      { error: "Failed to start shift" },
      { status: 500 }
    );
  }
}
