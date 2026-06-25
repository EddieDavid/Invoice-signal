import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getCompanyPlan, isPro } from "@/lib/plan";
import ProGate from "@/components/ProGate";
import ClientDelayInput from "@/components/ClientDelayInput";
import { scoreClient, detectDegradation, CLIENT_RISK_LABELS, type ClientRiskScore } from "@/lib/scoring";

function getDaysOverdue(dueDate: Date): number {
  return Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
}

function ClientScoreBadge({ score }: { score: ClientRiskScore }) {
  const { label, className, dot } = CLIENT_RISK_LABELS[score];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export default async function ClientsPage() {
  const { companyId } = await requireAuth();
  const plan = await getCompanyPlan(companyId);
  const pro = isPro(plan);

  if (!pro) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Fiches clients</h1>
          <p className="text-gray-500 text-sm mt-1">Historique et comportement de paiement par client</p>
        </div>
        <ProGate feature="Fiches clients — Historique de paiement, comportement et délai personnalisé par client" />
      </div>
    );
  }

  const [invoices, clientProfiles] = await Promise.all([
    prisma.invoice.findMany({
      where: { companyId },
      include: { reminders: { orderBy: { sentAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.clientProfile.findMany({ where: { companyId } }),
  ]);

  const profileMap = new Map(clientProfiles.map((p) => [p.clientEmail, p]));

  type ClientData = {
    name: string;
    email: string;
    totalInvoices: number;
    paidInvoices: number;
    lateInvoices: number;
    totalDaysLate: number;
    unpaidAmount: number;
    maxReminders: number;
    // for client scoring
    totalPaidInvoices: number;
    paidLateCount: number;
    sumDaysLateForScore: number;
    hasUnpaidOldInvoice: boolean;
    paidEntries: { updatedAt: Date; daysLate: number }[];
  };

  const clientMap = new Map<string, ClientData>();

  for (const inv of invoices) {
    const key = inv.clientEmail;
    if (!clientMap.has(key)) {
      clientMap.set(key, {
        name: inv.clientName, email: inv.clientEmail,
        totalInvoices: 0, paidInvoices: 0, lateInvoices: 0,
        totalDaysLate: 0, unpaidAmount: 0, maxReminders: 0,
        totalPaidInvoices: 0, paidLateCount: 0, sumDaysLateForScore: 0,
        hasUnpaidOldInvoice: false, paidEntries: [],
      });
    }
    const c = clientMap.get(key)!;
    c.totalInvoices++;
    const reminderStep = inv.reminders[0]?.step ?? 0;
    if (reminderStep > c.maxReminders) c.maxReminders = reminderStep;

    if (inv.status === "paid") {
      c.paidInvoices++;
      c.totalPaidInvoices++;
      if (reminderStep > 0) {
        c.lateInvoices++;
        c.paidLateCount++;
      }
      const daysLate = Math.floor((inv.updatedAt.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      c.sumDaysLateForScore += daysLate;
      c.paidEntries.push({ updatedAt: inv.updatedAt, daysLate });
    } else {
      c.unpaidAmount += inv.amount;
      const daysOverdue = getDaysOverdue(inv.dueDate);
      if (daysOverdue > 0) {
        c.lateInvoices++;
        c.totalDaysLate += daysOverdue;
      }
      if (daysOverdue > 60) c.hasUnpaidOldInvoice = true;
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Score client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Délai relance</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const lateRate = client.totalInvoices > 0 ? Math.round((client.lateInvoices / client.totalInvoices) * 100) : 0;
                const avgDaysLate = client.totalPaidInvoices > 0
                  ? Math.round(client.sumDaysLateForScore / client.totalPaidInvoices)
                  : 0;
                const profile = profileMap.get(client.email);

                const clientScore = scoreClient({
                  totalPaidInvoices: client.totalPaidInvoices,
                  paidLateCount: client.paidLateCount,
                  avgDaysLate: client.totalPaidInvoices > 0 ? client.sumDaysLateForScore / client.totalPaidInvoices : 0,
                  hasUnpaidOldInvoice: client.hasUnpaidOldInvoice,
                });

                const sortedDaysLate = client.paidEntries
                  .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
                  .map((e) => e.daysLate);
                const { isDegrading, extraDays } = detectDegradation(sortedDaysLate, client.totalInvoices);

                return (
                  <tr key={client.email} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{client.name}</div>
                      <div className="text-gray-400 text-xs">{client.email}</div>
                      {isDegrading && (
                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                          ↗ Comportement en dégradation · paie {extraDays}j plus lentement que d'habitude
                        </div>
                      )}
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
                        <ClientScoreBadge score={clientScore} />
                        {client.totalPaidInvoices > 0 && (
                          <span className="text-xs text-gray-400">
                            {lateRate}% en retard
                            {avgDaysLate > 0 ? ` · moy. ${avgDaysLate}j après échéance` : avgDaysLate < 0 ? ` · moy. ${Math.abs(avgDaysLate)}j avant échéance` : ""}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ClientDelayInput
                        clientEmail={client.email}
                        initialInterval={profile?.customReminderInterval ?? null}
                      />
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
