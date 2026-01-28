// app/api/reports/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("argos_session")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea MANAGER
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user || user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Only managers can view reports" },
        { status: 403 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener todos los gastos del día
    const allExpenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Obtener todas las ventas del día
    const allSales = await prisma.sale.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calcular totales
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalSales = allSales.reduce((sum, sale) => sum + sale.amount, 0);
    const netProfit = totalSales - totalExpenses;

    // Agrupar por trabajador
    const workerSummary = new Map<
      number,
      {
        name: string;
        email: string;
        expenses: number;
        sales: number;
        profit: number;
      }
    >();

    allExpenses.forEach((exp) => {
      if (!workerSummary.has(exp.userId)) {
        workerSummary.set(exp.userId, {
          name: exp.user.name,
          email: exp.user.email,
          expenses: 0,
          sales: 0,
          profit: 0,
        });
      }
      const summary = workerSummary.get(exp.userId)!;
      summary.expenses += exp.amount;
      summary.profit = summary.sales - summary.expenses;
    });

    allSales.forEach((sale) => {
      if (!workerSummary.has(sale.userId)) {
        workerSummary.set(sale.userId, {
          name: sale.user.name,
          email: sale.user.email,
          expenses: 0,
          sales: 0,
          profit: 0,
        });
      }
      const summary = workerSummary.get(sale.userId)!;
      summary.sales += sale.amount;
      summary.profit = summary.sales - summary.expenses;
    });

    return NextResponse.json({
      ok: true,
      date: today.toISOString().split("T")[0],
      summary: {
        totalExpenses,
        totalSales,
        netProfit,
      },
      expenses: allExpenses,
      sales: allSales,
      workerSummary: Array.from(workerSummary.entries()).map(([_, summary]) => summary),
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
