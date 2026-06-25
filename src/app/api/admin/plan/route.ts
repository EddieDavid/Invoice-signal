import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { key, companyId, plan } = await request.json();

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || key !== adminSecret) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (plan !== "starter" && plan !== "pro") {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  await prisma.company.update({ where: { id: companyId }, data: { plan } });
  return NextResponse.json({ ok: true });
}
