"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Invoice = {
  id: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  daysOverdue: number;
  lastReminderStep: number;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "En attente", className: "bg-gray-100 text-gray-600" },
    reminded: { label: "Relancé", className: "bg-amber-100 text-amber-700" },
    paid: { label: "Payée", className: "bg-green-100 text-green-700" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}

export default function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function sendReminder(id: string) {
    setLoadingId(id);
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: id }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error || "Erreur lors de la relance");
    else alert(data.message || "Relance envoyée !");
    setLoadingId(null);
    router.refresh();
  }

  async function markPaid(id: string) {
    setLoadingId(id);
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });
    setLoadingId(null);
    router.refresh();
  }

  async function deleteInvoice(id: string) {
    if (!confirm("Supprimer cette facture ?")) return;
    setLoadingId(id);
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">N° Facture</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Montant</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Retard</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Relances</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{inv.clientName}</div>
                <div className="text-gray-400 text-xs">{inv.clientEmail}</div>
              </td>
              <td className="px-4 py-3 text-gray-600">{inv.invoiceNumber}</td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">
                {inv.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              </td>
              <td className="px-4 py-3">
                {inv.status === "paid" ? (
                  <span className="text-gray-400">—</span>
                ) : inv.daysOverdue > 0 ? (
                  <span className="text-red-600 font-medium">{inv.daysOverdue}j</span>
                ) : (
                  <span className="text-gray-400 text-xs">À venir</span>
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={inv.status} />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {inv.lastReminderStep}/4
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 justify-end">
                  {inv.status !== "paid" && inv.lastReminderStep < 4 && (
                    <button
                      onClick={() => sendReminder(inv.id)}
                      disabled={loadingId === inv.id}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors"
                    >
                      {loadingId === inv.id ? "..." : "Relancer"}
                    </button>
                  )}
                  {inv.status !== "paid" && (
                    <button
                      onClick={() => markPaid(inv.id)}
                      disabled={loadingId === inv.id}
                      className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100 disabled:opacity-50 transition-colors"
                    >
                      Marquer payée
                    </button>
                  )}
                  <button
                    onClick={() => deleteInvoice(inv.id)}
                    disabled={loadingId === inv.id}
                    className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
