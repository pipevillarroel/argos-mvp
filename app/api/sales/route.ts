// app/api/sales/route.ts
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.findMany({
      where: {
        userId: parseInt(userId),
        date: {
          gte: today,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = sales.reduce((sum, sale) => sum + sale.amount, 0);

    return NextResponse.json({
      ok: true,
      sales,
      total,
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("argos_session")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { description, amount } = await req.json();

    if (!description || !amount) {
      return NextResponse.json(
        { error: "Description and amount are required" },
        { status: 400 }
      );
    }

    const sale = await prisma.sale.create({
      data: {
        description,
        amount: parseFloat(amount),
        userId: parseInt(userId),
      },
    });

    return NextResponse.json(
      {
        ok: true,
        sale,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
