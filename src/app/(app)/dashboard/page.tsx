import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import InvoiceTable from "@/components/InvoiceTable";
import Link from "next/link";
import { scoreInvoice } from "@/lib/scoring";

function getDaysOverdue(dueDate: Date): number {
  return Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  const { companyId } = await requireAuth();

  const invoices = await prisma.invoice.findMany({
    where: { companyId },
    orderBy: { dueDate: "asc" },
    include: { reminders: { orderBy: { sentAt: "desc" }, take: 1 } },
  });

  // Build client history map
  const clientHistoryMap = new Map<string, { totalInvoices: number; invoicesWithReminders: number }>();
  for (const inv of invoices) {
    const email = inv.clientEmail;
    if (!clientHistoryMap.has(email)) {
      clientHistoryMap.set(email, { totalInvoices: 0, invoicesWithReminders: 0 });
    }
    const h = clientHistoryMap.get(email)!;
    h.totalInvoices++;
    if ((inv.reminders[0]?.step ?? 0) > 0) h.invoicesWithReminders++;
  }

  const tableData = invoices.map((inv) => {
    const daysOverdue = getDaysOverdue(inv.dueDate);
    const lastReminderStep = inv.reminders[0]?.step ?? 0;
    const clientHistory = clientHistoryMap.get(inv.clientEmail) ?? { totalInvoices: 1, invoicesWithReminders: 0 };
    const { riskScore, recommendedAction } = scoreInvoice(daysOverdue, lastReminderStep, inv.status, clientHistory);
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
    };
  });

  // Summary stats
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
        <Link href="/import" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Importer un CSV
        </Link>
      </div>

      {/* Cartes stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Total impayé</p>
          <p className="text-3xl font-bold text-gray-900">
            {totalUnpaid.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </p>
          <p className="text-xs text-gray-400 mt-2">{unpaid.length} facture{unpaid.length > 1 ? "s" : ""} en cours</p>
        </div>
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
        <div className="bg-white rounded-2xl border border-green-100 p-5">
          <p className="text-xs font-medium text-green-500 uppercase tracking-wide mb-3">Factures payées</p>
          <p className="text-3xl font-bold text-green-600">{invoices.filter((inv) => inv.status === "paid").length}</p>
          <p className="text-xs text-green-300 mt-2">sur {invoices.length} au total</p>
        </div>
      </div>

      {/* Répartition risque */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex items-center gap-3 bg-white rounded-xl border border-green-100 px-4 py-3">
            <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Faible risque</p>
              <p className="font-bold text-gray-900">{greenCount} facture{greenCount > 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-amber-100 px-4 py-3">
            <div className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Risque moyen</p>
              <p className="font-bold text-gray-900">{yellowCount} facture{yellowCount > 1 ? "s" : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl border border-red-100 px-4 py-3">
            <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Risque élevé</p>
              <p className="font-bold text-gray-900">{redCount} facture{redCount > 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-gray-700 font-medium">Aucune facture importée</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            Importez votre premier fichier CSV pour commencer.{" "}
            <a href="/factures_test.csv" download className="text-blue-600 hover:underline">
              Télécharger le fichier CSV d'exemple
            </a>
          </p>
          <Link href="/import" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Importer un CSV
          </Link>
        </div>
      ) : (
        <InvoiceTable invoices={tableData} />
      )}
    </div>
  );
}
