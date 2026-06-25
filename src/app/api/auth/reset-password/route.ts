import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "invoice-signal-secret-local"
);

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "reset" || typeof payload.companyId !== "string") {
      return NextResponse.json({ error: "Lien invalide" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.company.update({
      where: { id: payload.companyId },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Lien expiré ou invalide" }, { status: 400 });
  }
}
