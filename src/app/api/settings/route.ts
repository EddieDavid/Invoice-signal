import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { companyId } = session;

  const { templates, interval, paymentInfo } = await request.json();

  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { companyId_step: { companyId, step: t.step } },
      create: { companyId, step: t.step, subject: t.subject, body: t.body },
      update: { subject: t.subject, body: t.body },
    });
  }

  await prisma.settings.upsert({
    where: { companyId },
    create: { companyId, reminderInterval: interval, paymentInfo: paymentInfo ?? null },
    update: { reminderInterval: interval, paymentInfo: paymentInfo ?? null },
  });

  return NextResponse.json({ ok: true });
}
