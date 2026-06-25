import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { applyTemplate, DEFAULT_TEMPLATES } from "@/lib/templates";
import { getPaymentLink } from "@/lib/payment";
import { trackEvent } from "@/lib/analytics";
import { personalizeReminderEmail } from "@/lib/ai";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { companyId } = session;

  const { invoiceId } = await request.json();

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { reminders: true },
  });

  if (!invoice || invoice.companyId !== companyId) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }
  if (invoice.status === "paid") {
    return NextResponse.json({ error: "Cette facture est déjà payée" }, { status: 400 });
  }

  const nextStep = invoice.reminders.length + 1;
  if (nextStep > 4) {
    return NextResponse.json({ error: "Séquence de relance terminée (4/4)" }, { status: 400 });
  }

  let template = await prisma.emailTemplate.findUnique({
    where: { companyId_step: { companyId, step: nextStep } },
  });
  if (!template) {
    const defaultTpl = DEFAULT_TEMPLATES.find((t) => t.step === nextStep)!;
    template = await prisma.emailTemplate.create({ data: { companyId, ...defaultTpl } });
  }

  const daysOverdue = Math.max(0, Math.floor((Date.now() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)));
  const paymentLink = getPaymentLink(invoice.id);

  const vars = {
    nom_client: invoice.clientName,
    montant: invoice.amount.toFixed(2),
    numero_facture: invoice.invoiceNumber,
    jours_retard: String(daysOverdue),
    lien_paiement: paymentLink,
  };

  const resolvedBody = applyTemplate(template.body, vars);

  // Personnalisation IA pour les relances 2, 3 et 4 uniquement
  let finalBody = resolvedBody;
  if (nextStep >= 2) {
    const clientInvoices = await prisma.invoice.findMany({
      where: { companyId, clientEmail: invoice.clientEmail },
      include: { _count: { select: { reminders: true } } },
    });
    const invoicesWithReminders = clientInvoices.filter((inv) => inv._count.reminders > 0).length;

    finalBody = await personalizeReminderEmail({
      templateBody: resolvedBody,
      step: nextStep,
      daysOverdue,
      amount: invoice.amount,
      clientName: invoice.clientName,
      invoiceNumber: invoice.invoiceNumber,
      invoicesWithReminders,
      totalInvoices: clientInvoices.length,
    });
  }

  await sendEmail({
    to: invoice.clientEmail,
    subject: applyTemplate(template.subject, vars),
    body: finalBody,
    invoiceId: invoice.id,
    step: nextStep,
  });

  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "reminded" } });
  await trackEvent(companyId, "reminder_sent", { step: nextStep, invoice_id: invoiceId });

  const isDemoMode = !process.env.RESEND_API_KEY;
  return NextResponse.json({
    message: isDemoMode
      ? `Relance ${nextStep}/4 simulée ! Consultez la boîte simulée pour voir l'email.`
      : `Relance ${nextStep}/4 envoyée à ${invoice.clientEmail}`,
  });
}
