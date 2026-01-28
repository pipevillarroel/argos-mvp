// app/api/shifts/[id]/close/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/shifts/[id]/close
 * WORKER: Cerrar turno (queda en solo lectura)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { error: "Only workers can close shifts" },
        { status: 403 }
      );
    }

    // Verificar que el turno pertenece al usuario
    const shift = await prisma.shift.findUnique({
      where: { id: parseInt(id) },
    });

    if (!shift) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      );
    }

    if (shift.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only close your own shifts" },
        { status: 403 }
      );
    }

    if (shift.closed) {
      return NextResponse.json(
        { error: "Shift is already closed" },
        { status: 409 }
      );
    }

    // Cerrar turno
    const closedShift = await prisma.shift.update({
      where: { id: parseInt(id) },
      data: {
        closed: true,
        endTime: new Date(),
      },
      include: {
        expenses: true,
        sales: true,
      },
    });

    // Calcular totales del turno
    const totalExpenses = closedShift.expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const totalSales = closedShift.sales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );

    return NextResponse.json({
      ok: true,
      shift: closedShift,
      summary: {
        totalExpenses,
        totalSales,
        profit: totalSales - totalExpenses,
        transactionCount: closedShift.expenses.length + closedShift.sales.length,
      },
    });
  } catch (error) {
    console.error("Close shift error:", error);
    return NextResponse.json(
      { error: "Failed to close shift" },
      { status: 500 }
    );
  }
}
