import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { sendSimpleEmail } from "@/lib/email";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "invoice-signal-secret-local"
);

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

  const company = await prisma.company.findUnique({ where: { email } });

  // Toujours répondre OK pour ne pas révéler si l'email existe
  if (!company) return NextResponse.json({ ok: true });

  const token = await new SignJWT({ companyId: company.id, type: "reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(secret);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://invoice-signal.vercel.app";
  const resetLink = `${baseUrl}/reinitialiser-mot-de-passe?token=${token}`;

  await sendSimpleEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe — InvoiceSignal",
    body: `Bonjour,\n\nVous avez demandé à réinitialiser votre mot de passe InvoiceSignal.\n\nCliquez sur ce lien pour choisir un nouveau mot de passe (valable 1 heure) :\n${resetLink}\n\nSi vous n'avez pas fait cette demande, ignorez cet email.\n\nL'équipe InvoiceSignal`,
  });

  return NextResponse.json({ ok: true });
}
