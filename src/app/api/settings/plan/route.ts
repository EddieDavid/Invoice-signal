import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { plan } = await request.json();
  if (plan !== "starter" && plan !== "pro") {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  await prisma.company.update({
    where: { id: session.companyId },
    data: { plan },
  });

  return NextResponse.json({ ok: true, plan });
}
