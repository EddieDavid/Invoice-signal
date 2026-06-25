import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getCompanyPlan, isPro } from "@/lib/plan";
import { scoreInvoice } from "@/lib/scoring";
import Link from "next/link";
import BulkRelanceButton from "@/components/BulkRelanceButton";

function getDaysOverdue(dueDate: Date): number {
  return Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string }>;
}) {
  const { companyId } = await requireAuth();
  const plan = await getCompanyPlan(companyId);
  const pro = isPro(plan);
  const { imported } = await searchParams;
  const justImported = imported ? Number(imported) : null;

  const invoices = await prisma.invoice.findMany({
    where: { companyId },
    orderBy: { dueDate: "asc" },
    include: { reminders: { orderBy: { sentAt: "desc" }, take: 1 } },
  });

  // Build client history map
  const clientHistoryMap = new Map<string, { totalInvoices: number; invoicesWithReminders: number }>();
  for (const inv of invoices) {
    const email = inv.clientEmail;
    if (!clientHistoryMap.has(email)) clientHistoryMap.set(email, { totalInvoices: 0, invoicesWithReminders: 0 });
    const h = clientHistoryMap.get(email)!;
    h.totalInvoices++;
    if ((inv.reminders[0]?.step ?? 0) > 0) h.invoicesWithReminders++;
  }

  // Score invoices
  const scored = invoices.map((inv) => {
    const daysOverdue = getDaysOverdue(inv.dueDate);
    const lastReminderStep = inv.reminders[0]?.step ?? 0;
    const clientHistory = clientHistoryMap.get(inv.clientEmail) ?? { totalInvoices: 1, invoicesWithReminders: 0 };
    const { riskScore } = scoreInvoice(daysOverdue, lastReminderStep, inv.status, clientHistory);
    return { ...inv, daysOverdue, lastReminderStep, riskScore };
  });

  // Relanceable: overdue, not paid, step < 4
  const relanceableIds = scored
    .filter((inv) => inv.status !== "paid" && inv.lastReminderStep < 4 && inv.daysOverdue > 0)
    .map((inv) => inv.id);

  // --- Starter metrics ---
  const overdueInvoices = scored.filter((inv) => inv.status !== "paid" && inv.daysOverdue > 0);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const overdueCount = overdueInvoices.length;
  const dueSoonCount = scored.filter(
    (inv) => inv.status !== "paid" && inv.daysOverdue <= 0 && inv.daysOverdue > -8
  ).length;

  // --- Pro metrics ---
  const priorityClientEmails = new Set(
    scored
      .filter((inv) => inv.status !== "paid" && (inv.riskScore === "red" || (inv.riskScore === "yellow" && inv.daysOverdue > 5)))
      .map((inv) => inv.clientEmail)
  );
  const recoverableAmount = scored
    .filter((inv) => inv.status !== "paid" && inv.riskScore === "yellow")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const highRiskClientEmails = new Set(
    scored.filter((inv) => inv.status !== "paid" && inv.riskScore === "red").map((inv) => inv.clientEmail)
  );

  const fmt = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {justImported ? (
          <>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full mb-4">
              ✓ {justImported} facture{justImported > 1 ? "s" : ""} importée{justImported > 1 ? "s" : ""} avec succès
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Voici votre situation en un coup d'œil</h1>
            <p className="text-gray-500">C'est le moment de lancer vos relances.</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Résumé de votre situation</h1>
            <p className="text-gray-500">Vue d'ensemble de vos factures impayées.</p>
          </>
        )}
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-gray-700 font-medium mb-4">Aucune facture importée pour l'instant</p>
          <Link href="/import" className="inline-block text-sm font-semibold text-white px-5 py-2.5 rounded-full hover:opacity-90" style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}>
            Importer un CSV
          </Link>
        </div>
      ) : (
        <>
          {/* Métriques */}
          {pro ? (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-red-100 p-6">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">En retard en ce moment</p>
                <p className="text-4xl font-extrabold text-red-600 mb-1">{fmt(totalOverdue)}</p>
                <p className="text-sm text-red-300">{overdueCount} facture{overdueCount > 1 ? "s" : ""} en retard</p>
              </div>
              <div className="bg-white rounded-2xl border border-amber-100 p-6">
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-3">Récupérables rapidement</p>
                <p className="text-4xl font-extrabold text-amber-600 mb-1">{fmt(recoverableAmount)}</p>
                <p className="text-sm text-amber-300">avec une simple relance</p>
              </div>
              <div className="bg-white rounded-2xl border border-violet-100 p-6">
                <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-3">Clients à traiter en priorité</p>
                <p className="text-4xl font-extrabold text-violet-700 mb-1">{priorityClientEmails.size}</p>
                <p className="text-sm text-violet-300">risque moyen ou élevé + retard</p>
              </div>
              <div className="bg-white rounded-2xl border border-red-100 p-6">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-3">Clients à risque élevé</p>
                <p className="text-4xl font-extrabold text-red-700 mb-1">{highRiskClientEmails.size}</p>
                <p className="text-sm text-red-300">score rouge — action urgente</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-red-100 p-6">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">Total en retard</p>
                <p className="text-3xl font-extrabold text-red-600 mb-1">{fmt(totalOverdue)}</p>
                <p className="text-sm text-red-300">{overdueCount} facture{overdueCount > 1 ? "s" : ""}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">En retard</p>
                <p className="text-3xl font-extrabold text-gray-800 mb-1">{overdueCount}</p>
                <p className="text-sm text-gray-300">facture{overdueCount > 1 ? "s" : ""} à relancer</p>
              </div>
              <div className="bg-white rounded-2xl border border-amber-100 p-6">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-3">Échéance proche</p>
                <p className="text-3xl font-extrabold text-amber-600 mb-1">{dueSoonCount}</p>
                <p className="text-sm text-amber-300">dans les 7 prochains jours</p>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-4">
            <BulkRelanceButton invoiceIds={relanceableIds} />
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors px-2"
            >
              Voir le détail →
            </Link>
          </div>

          {!pro && (
            <div className="mt-4 bg-violet-50 border border-violet-100 rounded-xl p-4 flex items-center gap-4">
              <span className="text-2xl">✨</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-violet-800">Passez en Pro pour voir quelles factures sont récupérables rapidement</p>
                <p className="text-xs text-violet-500 mt-0.5">Score de risque, clients prioritaires et montant récupérable en un clic.</p>
              </div>
              <Link href="/settings#plan" className="text-xs font-semibold text-white px-4 py-2 rounded-full whitespace-nowrap" style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}>
                Voir le plan Pro
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
