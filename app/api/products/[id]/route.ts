// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/products/[id]
 * SOLO MANAGER: Actualizar producto (nombre, precio, activo/inactivo)
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

    // Verificar que sea MANAGER
    const user = await prisma.user.findUnique({
      where: { id: parseInt(sessionId) },
    });

    if (!user || user.role !== "MANAGER") {
      return NextResponse.json(
        { error: "Only managers can update products" },
        { status: 403 }
      );
    }

    const { name, price, active } = await req.json();

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(active !== undefined && { active }),
      },
    });

    return NextResponse.json({
      ok: true,
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
