// app/api/adjustments/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/adjustments
 * Crear un ajuste o reversa (MANAGER solo puede hacer ajustes)
 *
 * Body:
 * {
 *   type: "reversal" | "correction",
 *   reason: "string",
 *   targetId: number,
 *   targetType: "SALE" | "EXPENSE",
 *   adjustmentAmount?: number (para correction, se suma/resta)
 * }
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

    if (!user || user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Only managers can create adjustments" },
        { status: 403 }
      );
    }

    const {
      type,
      reason,
      targetId,
      targetType,
      adjustmentAmount = 0,
    } = await req.json();

    if (!type || !reason || !targetId || !targetType) {
      return NextResponse.json(
        {
          error:
            "type, reason, targetId, and targetType are required",
        },
        { status: 400 }
      );
    }

    if (targetType !== "SALE" && targetType !== "EXPENSE") {
      return NextResponse.json(
        { error: "targetType must be SALE or EXPENSE" },
        { status: 400 }
      );
    }

    if (type !== "reversal" && type !== "correction") {
      return NextResponse.json(
        { error: "type must be reversal or correction" },
        { status: 400 }
      );
    }

    // Obtener el registro original
    let original;
    if (targetType === "SALE") {
      original = await prisma.sale.findUnique({
        where: { id: targetId },
      });
    } else {
      original = await prisma.expense.findUnique({
        where: { id: targetId },
      });
    }

    if (!original) {
      return NextResponse.json(
        { error: `${targetType} not found` },
        { status: 404 }
      );
    }

    // Calcular montos
    const originalAmount = original.amount;
    let newAmount = originalAmount;

    if (type === "reversal") {
      // Reversal = nula el registro completamente
      newAmount = 0;
    } else if (type === "correction") {
      // Correction = ajusta el monto
      newAmount = originalAmount + adjustmentAmount;
    }

    // Crear registro de ajuste (auditoría)
    const adjustment = await prisma.adjustment.create({
      data: {
        type,
        reason,
        originalAmount,
        adjustmentAmount,
        newAmount,
        targetId,
        targetType,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        adjustment,
        message: `${type === "reversal" ? "Reversal" : "Correction"} recorded. Original: $${originalAmount}, New: $${newAmount}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create adjustment error:", error);
    return NextResponse.json(
      { error: "Failed to create adjustment" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/adjustments
 * Obtener historial de ajustes (MANAGER solo)
 * ?targetId=123&targetType=SALE
 */
export async function GET(req: Request) {
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

    if (!user || user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Only managers can view adjustments" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const targetId = url.searchParams.get("targetId");
    const targetType = url.searchParams.get("targetType");

    const where: any = {};
    if (targetId) {
      where.targetId = parseInt(targetId);
    }
    if (targetType) {
      where.targetType = targetType;
    }

    const adjustments = await prisma.adjustment.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      adjustments,
    });
  } catch (error) {
    console.error("Get adjustments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch adjustments" },
      { status: 500 }
    );
  }
}
