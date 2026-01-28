// app/api/expenses/route.ts
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

    const expenses = await prisma.expense.findMany({
      where: {
        userId: parseInt(userId),
        date: {
          gte: today,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return NextResponse.json({
      ok: true,
      expenses,
      total,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
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

    const { description, amount, category } = await req.json();

    if (!description || !amount) {
      return NextResponse.json(
        { error: "Description and amount are required" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        category: category || "Otros",
        userId: parseInt(userId),
      },
    });

    return NextResponse.json(
      {
        ok: true,
        expense,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
