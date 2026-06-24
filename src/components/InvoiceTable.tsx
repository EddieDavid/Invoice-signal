"use client";

import { useState, useEffect } from "react";
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

type Toast = { id: number; message: string; type: "success" | "error" };

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

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            t.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          <span>{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100 text-xs">✕</button>
        </div>
      ))}
    </div>
  );
}

export default function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const relanceable = invoices.filter((inv) => inv.status !== "paid" && inv.lastReminderStep < 4);

  function addToast(message: string, type: "success" | "error") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === relanceable.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(relanceable.map((inv) => inv.id)));
    }
  }

  async function sendReminder(id: string) {
    setLoadingIds((prev) => new Set(prev).add(id));
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: id }),
    });
    const data = await res.json();
    addToast(
      res.ok ? data.message || "Relance envoyée !" : data.error || "Erreur lors de la relance",
      res.ok ? "success" : "error"
    );
    setLoadingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    router.refresh();
  }

  async function sendBulkReminders() {
    const ids = [...selectedIds].filter((id) =>
      relanceable.some((inv) => inv.id === id)
    );
    if (ids.length === 0) return;
    setBulkLoading(true);
    let sent = 0;
    let errors = 0;
    for (const id of ids) {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: id }),
      });
      res.ok ? sent++ : errors++;
    }
    setBulkLoading(false);
    setSelectedIds(new Set());
    if (sent > 0) addToast(`${sent} relance${sent > 1 ? "s" : ""} envoyée${sent > 1 ? "s" : ""} !`, "success");
    if (errors > 0) addToast(`${errors} erreur${errors > 1 ? "s" : ""}`, "error");
    router.refresh();
  }

  async function markPaid(id: string) {
    setLoadingIds((prev) => new Set(prev).add(id));
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });
    setLoadingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    router.refresh();
  }

  async function deleteInvoice(id: string) {
    if (!confirm("Supprimer cette facture ?")) return;
    setLoadingIds((prev) => new Set(prev).add(id));
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    setLoadingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    router.refresh();
  }

  const allSelected = relanceable.length > 0 && selectedIds.size === relanceable.length;

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3">
          <span className="text-sm text-blue-700 font-medium">
            {selectedIds.size} facture{selectedIds.size > 1 ? "s" : ""} sélectionnée{selectedIds.size > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Tout désélectionner
            </button>
            <button
              onClick={sendBulkReminders}
              disabled={bulkLoading}
              className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {bulkLoading ? "Envoi en cours..." : `Relancer la sélection`}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 w-8">
                {relanceable.length > 0 && (
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600"
                    title="Tout sélectionner"
                  />
                )}
              </th>
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
            {invoices.map((inv) => {
              const canRelance = inv.status !== "paid" && inv.lastReminderStep < 4;
              const isLoading = loadingIds.has(inv.id);
              return (
                <tr
                  key={inv.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selectedIds.has(inv.id) ? "bg-blue-50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    {canRelance && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(inv.id)}
                        onChange={() => toggleSelect(inv.id)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                    )}
                  </td>
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
                  <td className="px-4 py-3 text-gray-500">{inv.lastReminderStep}/4</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {canRelance && (
                        <button
                          onClick={() => sendReminder(inv.id)}
                          disabled={isLoading}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors"
                        >
                          {isLoading ? "..." : "Relancer"}
                        </button>
                      )}
                      {inv.status !== "paid" && (
                        <button
                          onClick={() => markPaid(inv.id)}
                          disabled={isLoading}
                          className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100 disabled:opacity-50 transition-colors"
                        >
                          Marquer payée
                        </button>
                      )}
                      <button
                        onClick={() => deleteInvoice(inv.id)}
                        disabled={isLoading}
                        className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
