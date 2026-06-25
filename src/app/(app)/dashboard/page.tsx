import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import InvoiceTable from "@/components/InvoiceTable";
import ProGate from "@/components/ProGate";
import Link from "next/link";
import { scoreInvoice, scoreClient, detectDegradation, type ClientRiskScore } from "@/lib/scoring";
import { getCompanyPlan, isPro } from "@/lib/plan";

function getDaysOverdue(dueDate: Date): number {
  return Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  const { companyId } = await requireAuth();
  const plan = await getCompanyPlan(companyId);
  const pro = isPro(plan);

  const invoices = await prisma.invoice.findMany({
    where: { companyId },
    orderBy: { dueDate: "asc" },
    include: { reminders: { orderBy: { sentAt: "desc" }, take: 1 } },
  });

  // --- Build per-client aggregates for scoring ---
  type ClientAggregate = {
    totalInvoices: number;
    invoicesWithReminders: number;
    totalPaidInvoices: number;
    paidLateCount: number;
    totalDaysLate: number;
    hasUnpaidOldInvoice: boolean;
    paidEntries: { updatedAt: Date; daysLate: number }[];
  };

  const clientAggMap = new Map<string, ClientAggregate>();

  for (const inv of invoices) {
    const email = inv.clientEmail;
    if (!clientAggMap.has(email)) {
      clientAggMap.set(email, {
        totalInvoices: 0,
        invoicesWithReminders: 0,
        totalPaidInvoices: 0,
        paidLateCount: 0,
        totalDaysLate: 0,
        hasUnpaidOldInvoice: false,
        paidEntries: [],
      });
    }
    const agg = clientAggMap.get(email)!;
    agg.totalInvoices++;
    const reminderStep = inv.reminders[0]?.step ?? 0;
    if (reminderStep > 0) agg.invoicesWithReminders++;

    if (inv.status === "paid") {
      agg.totalPaidInvoices++;
      if (reminderStep > 0) agg.paidLateCount++;
      const daysLate = Math.floor((inv.updatedAt.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      agg.totalDaysLate += daysLate;
      agg.paidEntries.push({ updatedAt: inv.updatedAt, daysLate });
    } else {
      const daysOverdue = getDaysOverdue(inv.dueDate);
      if (daysOverdue > 60) agg.hasUnpaidOldInvoice = true;
    }
  }

  // --- Compute client risk scores & degradation ---
  const clientScoreMap = new Map<string, ClientRiskScore>();
  let degradingClientsCount = 0;

  for (const [email, agg] of clientAggMap) {
    const avgDaysLate = agg.totalPaidInvoices > 0 ? agg.totalDaysLate / agg.totalPaidInvoices : 0;
    const score = scoreClient({
      totalPaidInvoices: agg.totalPaidInvoices,
      paidLateCount: agg.paidLateCount,
      avgDaysLate,
      hasUnpaidOldInvoice: agg.hasUnpaidOldInvoice,
    });
    clientScoreMap.set(email, score);

    const sortedDaysLate = agg.paidEntries
      .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
      .map((e) => e.daysLate);
    const { isDegrading } = detectDegradation(sortedDaysLate, agg.totalInvoices);
    if (isDegrading) degradingClientsCount++;
  }

  // --- Score each invoice ---
  const tableData = invoices.map((inv) => {
    const daysOverdue = getDaysOverdue(inv.dueDate);
    const lastReminderStep = inv.reminders[0]?.step ?? 0;
    const clientHistory = {
      totalInvoices: clientAggMap.get(inv.clientEmail)?.totalInvoices ?? 1,
      invoicesWithReminders: clientAggMap.get(inv.clientEmail)?.invoicesWithReminders ?? 0,
    };
    const { riskScore, recommendedAction } = scoreInvoice(daysOverdue, lastReminderStep, inv.status, clientHistory);

    // Early warning: not yet due + client at risk
    const clientScore = clientScoreMap.get(inv.clientEmail) ?? "no_history";
    let earlyWarning: "watch" | "mention" | null = null;
    if (inv.status !== "paid" && daysOverdue <= 0) {
      if (clientScore === "red") earlyWarning = "watch";
      else if (clientScore === "yellow") earlyWarning = "mention";
    }

    return {
      id: inv.id,
      clientName: inv.clientName,
      clientEmail: inv.clientEmail,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.amount,
      createdAt: inv.createdAt.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      status: inv.status,
      daysOverdue,
      lastReminderStep,
      riskScore,
      recommendedAction,
      earlyWarning,
    };
  });

  const unpaid = tableData.filter((inv) => inv.status !== "paid");
  const totalUnpaid = unpaid.reduce((sum, inv) => sum + inv.amount, 0);
  const atRisk = unpaid.filter((inv) => inv.riskScore === "yellow" || inv.riskScore === "red");
  const amountAtRisk = atRisk.reduce((sum, inv) => sum + inv.amount, 0);
  const needsAction = unpaid.filter((inv) => inv.recommendedAction === "call" || inv.recommendedAction === "formal_notice");
  const greenCount = tableData.filter((inv) => inv.riskScore === "green").length;
  const yellowCount = tableData.filter((inv) => inv.riskScore === "yellow").length;
  const redCount = tableData.filter((inv) => inv.riskScore === "red").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">{invoices.length} facture(s) au total</p>
        </div>
        <div className="flex items-center gap-3">
          {!pro && (
            <span className="text-xs bg-violet-100 text-violet-700 font-semibold px-3 py-1.5 rounded-full">
              Plan Starter
            </span>
          )}
          <Link href="/import" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Importer un CSV
          </Link>
        </div>
      </div>

      {/* Cartes stats — visibles pour tous */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Total impayé</p>
          <p className="text-3xl font-bold text-gray-900">
            {totalUnpaid.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </p>
          <p className="text-xs text-gray-400 mt-2">{unpaid.length} facture{unpaid.length > 1 ? "s" : ""} en cours</p>
        </div>
        <div className="bg-white rounded-2xl border border-green-100 p-5">
          <p className="text-xs font-medium text-green-500 uppercase tracking-wide mb-3">Factures payées</p>
          <p className="text-3xl font-bold text-green-600">{invoices.filter((inv) => inv.status === "paid").length}</p>
          <p className="text-xs text-green-300 mt-2">sur {invoices.length} au total</p>
        </div>
      </div>

      {/* Cartes Pro */}
      {pro ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-2xl border border-red-100 p-5">
              <p className="text-xs font-medium text-red-400 uppercase tracking-wide mb-3">Montant à risque</p>
              <p className="text-3xl font-bold text-red-600">
                {amountAtRisk.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </p>
              <p className="text-xs text-red-300 mt-2">risque moyen + élevé</p>
            </div>
            <div className="bg-white rounded-2xl border border-orange-100 p-5">
              <p className="text-xs font-medium text-orange-400 uppercase tracking-wide mb-3">Clients à contacter</p>
              <p className="text-3xl font-bold text-orange-600">{needsAction.length}</p>
              <p className="text-xs text-orange-300 mt-2">appel ou mise en demeure</p>
            </div>
          </div>

          {invoices.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="flex items-center gap-3 bg-white rounded-xl border border-green-100 px-4 py-3">
                <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Faible risque</p>
                  <p className="font-bold text-gray-900">{greenCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl border border-amber-100 px-4 py-3">
                <div className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Risque moyen</p>
                  <p className="font-bold text-gray-900">{yellowCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl border border-red-100 px-4 py-3">
                <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Risque élevé</p>
                  <p className="font-bold text-gray-900">{redCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl border border-orange-100 px-4 py-3">
                <div className="w-3 h-3 rounded-full bg-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">En dégradation</p>
                  <p className="font-bold text-gray-900">{degradingClientsCount}</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mb-6">
          <ProGate feature="Vue d'ensemble du risque (Montant à risque, Clients à contacter, Répartition Vert/Jaune/Rouge)" />
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl border border-violet-100 p-8">
            <div className="max-w-lg">
              <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-2">Bienvenue sur InvoiceSignal</p>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Commencez en 3 étapes</h2>
              <p className="text-gray-500 text-sm mb-7">Votre tableau de bord est prêt. Il ne reste plus qu'à importer vos factures.</p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}>1</div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Téléchargez le fichier CSV d'exemple</p>
                    <p className="text-gray-400 text-xs mt-0.5">Pour voir le bon format à utiliser</p>
                    <a href="/factures_test.csv" download className="inline-block mt-2 text-xs text-violet-600 hover:underline font-medium">
                      Télécharger l'exemple →
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}>2</div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Importez vos factures en CSV</p>
                    <p className="text-gray-400 text-xs mt-0.5">Nom client, email, numéro, montant, date d'échéance</p>
                    <Link href="/import" className="inline-block mt-2 text-xs font-semibold text-white px-4 py-1.5 rounded-full transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}>
                      Importer un CSV
                    </Link>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-gray-200 text-gray-400">3</div>
                  <div>
                    <p className="font-medium text-gray-400 text-sm">Envoyez vos premières relances</p>
                    <p className="text-gray-300 text-xs mt-0.5">Sélectionnez les factures et relancez en un clic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <InvoiceTable invoices={tableData} pro={pro} />
      )}
    </div>
  );
}
