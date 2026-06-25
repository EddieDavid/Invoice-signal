import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCompanyPlan, isPro } from "@/lib/plan";

export async function PUT(request: Request, { params }: { params: Promise<{ email: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const plan = await getCompanyPlan(session.companyId);
  if (!isPro(plan)) return NextResponse.json({ error: "Plan Pro requis" }, { status: 403 });

  const { email } = await params;
  const clientEmail = decodeURIComponent(email);
  const { customReminderInterval } = await request.json();

  const interval = customReminderInterval === null || customReminderInterval === "" ? null : Number(customReminderInterval);
  if (interval !== null && (isNaN(interval) || interval < 1)) {
    return NextResponse.json({ error: "Délai invalide" }, { status: 400 });
  }

  await prisma.clientProfile.upsert({
    where: { companyId_clientEmail: { companyId: session.companyId, clientEmail } },
    create: { companyId: session.companyId, clientEmail, customReminderInterval: interval },
    update: { customReminderInterval: interval },
  });

  return NextResponse.json({ ok: true });
}
