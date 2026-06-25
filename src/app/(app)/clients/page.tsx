import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

function getDaysOverdue(dueDate: Date): number {
  return Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function ClientsPage() {
  const { companyId } = await requireAuth();

  const invoices = await prisma.invoice.findMany({
    where: { companyId },
    include: { reminders: { orderBy: { sentAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "asc" },
  });

  // Aggregation par client
  const clientMap = new Map<string, {
    name: string;
    email: string;
    totalInvoices: number;
    paidInvoices: number;
    lateInvoices: number;
    totalDaysLate: number;
    unpaidAmount: number;
    maxReminders: number;
  }>();

  for (const inv of invoices) {
    const key = inv.clientEmail;
    if (!clientMap.has(key)) {
      clientMap.set(key, { name: inv.clientName, email: inv.clientEmail, totalInvoices: 0, paidInvoices: 0, lateInvoices: 0, totalDaysLate: 0, unpaidAmount: 0, maxReminders: 0 });
    }
    const c = clientMap.get(key)!;
    c.totalInvoices++;
    const reminderStep = inv.reminders[0]?.step ?? 0;
    if (reminderStep > c.maxReminders) c.maxReminders = reminderStep;
    if (inv.status === "paid") {
      c.paidInvoices++;
      if (reminderStep > 0) c.lateInvoices++;
    } else {
      c.unpaidAmount += inv.amount;
      const daysOverdue = getDaysOverdue(inv.dueDate);
      if (daysOverdue > 0) {
        c.lateInvoices++;
        c.totalDaysLate += daysOverdue;
      }
    }
  }

  const clients = [...clientMap.values()].sort((a, b) => b.unpaidAmount - a.unpaidAmount);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Fiches clients</h1>
        <p className="text-gray-500 text-sm mt-1">{clients.length} client{clients.length > 1 ? "s" : ""} au total</p>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-700 font-medium">Aucun client pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1">Les clients apparaissent automatiquement après l'import de factures.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Factures</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Payées</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">En retard</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Montant impayé</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Comportement</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const lateRate = client.totalInvoices > 0 ? Math.round((client.lateInvoices / client.totalInvoices) * 100) : 0;
                const avgDaysLate = client.lateInvoices > 0 ? Math.round(client.totalDaysLate / client.lateInvoices) : 0;
                const isRisk = client.lateInvoices >= 2 || client.maxReminders >= 3;
                return (
                  <tr key={client.email} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-gray-400 text-xs">{client.email}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{client.totalInvoices}</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">{client.paidInvoices}</td>
                    <td className="px-4 py-3 text-right">
                      {client.lateInvoices > 0 ? (
                        <span className="text-red-600 font-medium">{client.lateInvoices}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {client.unpaidAmount > 0 ? (
                        <span className="text-red-600">
                          {client.unpaidAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                        </span>
                      ) : (
                        <span className="text-green-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {isRisk ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                            ⚠️ Payeur à risque
                          </span>
                        ) : client.lateInvoices === 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            ✓ Payeur fiable
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                            ~ Retards occasionnels
                          </span>
                        )}
                        {lateRate > 0 && (
                          <span className="text-xs text-gray-400">{lateRate}% en retard{avgDaysLate > 0 ? ` · moy. ${avgDaysLate}j` : ""}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
