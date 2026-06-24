import { NextResponse } from "next/server";
import { loginCompany, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    const company = await loginCompany(email, password);
    const token = await createSession(company.id);

    const response = NextResponse.json({ ok: true });
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur de connexion";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
