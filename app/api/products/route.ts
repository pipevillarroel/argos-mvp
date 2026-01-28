// app/api/products/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/products
 * Obtiene catálogo de productos activos (solo manager puede crear/editar)
 * Workers solo pueden ver
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      ok: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * SOLO MANAGER: Crear nuevo producto
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

    // Verificar que sea MANAGER
    const user = await prisma.user.findUnique({
      where: { id: parseInt(sessionId) },
    });

    if (!user || user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Only managers can create products" },
        { status: 403 }
      );
    }

    const { name, price } = await req.json();

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        active: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
