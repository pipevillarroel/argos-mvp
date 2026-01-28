// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    message: "Logged out successfully",
  });

  response.cookies.set("argos_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
