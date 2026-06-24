import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import InvoiceTable from "@/components/InvoiceTable";
import Link from "next/link";

function getDaysOverdue(dueDate: Date): number {
  const diff = new Date().getTime() - dueDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  const { companyId } = await requireAuth();

  const invoices = await prisma.invoice.findMany({
    where: { companyId },
    orderBy: { dueDate: "asc" },
    include: { reminders: { orderBy: { sentAt: "desc" }, take: 1 } },
  });

  const unpaid = invoices.filter((inv) => inv.status !== "paid");
  const totalUnpaid = unpaid.reduce((sum: number, inv) => sum + inv.amount, 0);
  const overdueCount = unpaid.filter((inv) => getDaysOverdue(inv.dueDate) > 0).length;

  const tableData = invoices.map((inv) => ({
    id: inv.id,
    clientName: inv.clientName,
    clientEmail: inv.clientEmail,
    invoiceNumber: inv.invoiceNumber,
    amount: inv.amount,
    dueDate: inv.dueDate.toISOString(),
    status: inv.status,
    daysOverdue: getDaysOverdue(inv.dueDate),
    lastReminderStep: inv.reminders[0]?.step ?? 0,
  }));

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

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total impayé</p>
          <p className="text-2xl font-bold text-red-600">
            {totalUnpaid.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Factures en retard</p>
          <p className="text-2xl font-bold text-orange-500">{overdueCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Factures payées</p>
          <p className="text-2xl font-bold text-green-600">
            {invoices.filter((inv) => inv.status === "paid").length}
          </p>
        </div>
      </div>

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
