import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export default async function InboxPage() {
  const { companyId } = await requireAuth();

  const reminders = await prisma.reminder.findMany({
    where: { simulated: true, invoice: { companyId } },
    include: { invoice: true },
    orderBy: { sentAt: "desc" },
  });

  const stepLabels: Record<number, string> = {
    1: "1er rappel",
    2: "2e relance",
    3: "3e relance",
    4: "Mise en demeure",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Boîte de réception simulée</h1>
        <p className="text-gray-500 text-sm mt-1">
          Emails qui auraient été envoyés à vos clients (mode démo actif).
        </p>
      </div>

      {reminders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-700 font-medium">Aucun email simulé</p>
          <p className="text-gray-400 text-sm mt-1">
            Déclenchez une relance depuis le dashboard pour voir les emails ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => (
            <details key={r.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <summary className="px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {stepLabels[r.step] ?? `Étape ${r.step}`}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{r.invoice.clientEmail}</span>
                  <span className="text-sm text-gray-500 flex-1 truncate">{r.subject}</span>
                  <span className="text-xs text-gray-400 ml-auto shrink-0">
                    {new Date(r.sentAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </summary>
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                <div className="text-xs text-gray-500 mb-3 space-y-1">
                  <div><span className="font-medium">À :</span> {r.invoice.clientEmail}</div>
                  <div><span className="font-medium">Objet :</span> {r.subject}</div>
                  <div><span className="font-medium">Client :</span> {r.invoice.clientName}</div>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans bg-white rounded-lg p-4 border border-gray-200">
                  {r.body}
                </pre>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
