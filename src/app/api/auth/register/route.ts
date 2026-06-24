import { NextResponse } from "next/server";
import { registerCompany, createSession } from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères." }, { status: 400 });
  }

  try {
    const company = await registerCompany(name, email, password);
    const token = await createSession(company.id);
    await trackEvent(company.id, "company_registered", { company_name: name });

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
    const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
