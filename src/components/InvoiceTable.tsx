"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ACTION_LABELS, RISK_LABELS, type RiskScore, type RecommendedAction } from "@/lib/scoring";

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
  riskScore: RiskScore;
  recommendedAction: RecommendedAction;
};

type Toast = { id: number; message: string; type: "success" | "error" };
type SortKey = "clientName" | "invoiceNumber" | "amount" | "daysOverdue" | "status" | "lastReminderStep" | "riskScore";
type SortDir = "asc" | "desc";

const RISK_ORDER: Record<RiskScore, number> = { green: 1, yellow: 2, red: 3 };

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

function RiskBadge({ score }: { score: RiskScore }) {
  const { label, className } = RISK_LABELS[score];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${score === "green" ? "bg-green-500" : score === "yellow" ? "bg-amber-500" : "bg-red-500"}`} />
      {label}
    </span>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${t.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          <span>{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-70 hover:opacity-100 text-xs">✕</button>
        </div>
      ))}
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-gray-300 ml-1">↕</span>;
  return <span className="text-blue-600 ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

export default function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRelances, setFilterRelances] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("riskScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let result = [...invoices];

    if (filterStatus !== "all") result = result.filter((inv) => inv.status === filterStatus);
    if (filterRisk !== "all") result = result.filter((inv) => inv.riskScore === filterRisk);
    if (filterRelances === "0") result = result.filter((inv) => inv.lastReminderStep === 0);
    else if (filterRelances === "1-3") result = result.filter((inv) => inv.lastReminderStep >= 1 && inv.lastReminderStep < 4);
    else if (filterRelances === "4") result = result.filter((inv) => inv.lastReminderStep === 4);

    result.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;
      if (sortKey === "clientName") { valA = a.clientName.toLowerCase(); valB = b.clientName.toLowerCase(); }
      else if (sortKey === "invoiceNumber") { valA = a.invoiceNumber.toLowerCase(); valB = b.invoiceNumber.toLowerCase(); }
      else if (sortKey === "amount") { valA = a.amount; valB = b.amount; }
      else if (sortKey === "daysOverdue") { valA = a.daysOverdue; valB = b.daysOverdue; }
      else if (sortKey === "status") { valA = a.status; valB = b.status; }
      else if (sortKey === "lastReminderStep") { valA = a.lastReminderStep; valB = b.lastReminderStep; }
      else if (sortKey === "riskScore") { valA = RISK_ORDER[a.riskScore]; valB = RISK_ORDER[b.riskScore]; }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [invoices, filterStatus, filterRelances, filterRisk, sortKey, sortDir]);

  const relanceable = filtered.filter((inv) => inv.status !== "paid" && inv.lastReminderStep < 4);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

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
    if (selectedIds.size === relanceable.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(relanceable.map((inv) => inv.id)));
  }

  async function sendReminder(id: string) {
    setLoadingIds((prev) => new Set(prev).add(id));
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: id }),
    });
    const data = await res.json();
    addToast(res.ok ? data.message || "Relance envoyée !" : data.error || "Erreur", res.ok ? "success" : "error");
    setLoadingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    router.refresh();
  }

  async function sendBulkReminders() {
    const ids = [...selectedIds].filter((id) => relanceable.some((inv) => inv.id === id));
    if (ids.length === 0) return;
    setBulkLoading(true);
    let sent = 0; let errors = 0;
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
    await fetch(`/api/invoices/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "paid" }) });
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
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Statut</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="reminded">Relancé</option>
            <option value="paid">Payée</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Risque</label>
          <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="all">Tous</option>
            <option value="red">Élevé 🔴</option>
            <option value="yellow">Moyen 🟡</option>
            <option value="green">Faible 🟢</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Relances</label>
          <select value={filterRelances} onChange={(e) => setFilterRelances(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="all">Toutes</option>
            <option value="0">Aucune relance</option>
            <option value="1-3">1 à 3 relances</option>
            <option value="4">Séquence terminée</option>
          </select>
        </div>
        {(filterStatus !== "all" || filterRelances !== "all" || filterRisk !== "all") && (
          <button onClick={() => { setFilterStatus("all"); setFilterRelances("all"); setFilterRisk("all"); }} className="text-xs text-gray-400 hover:text-gray-600 underline">
            Réinitialiser
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} facture{filtered.length > 1 ? "s" : ""}</span>
      </div>

      {/* Barre sélection groupée */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3">
          <span className="text-sm text-blue-700 font-medium">
            {selectedIds.size} facture{selectedIds.size > 1 ? "s" : ""} sélectionnée{selectedIds.size > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-blue-500 hover:text-blue-700">Tout désélectionner</button>
            <button onClick={sendBulkReminders} disabled={bulkLoading} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium">
              {bulkLoading ? "Envoi en cours..." : "Relancer la sélection"}
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
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded border-gray-300 text-blue-600" title="Tout sélectionner" />
                )}
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort("clientName")}>
                Client <SortIcon active={sortKey === "clientName"} dir={sortDir} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort("invoiceNumber")}>
                N° Facture <SortIcon active={sortKey === "invoiceNumber"} dir={sortDir} />
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort("amount")}>
                Montant <SortIcon active={sortKey === "amount"} dir={sortDir} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort("daysOverdue")}>
                Retard <SortIcon active={sortKey === "daysOverdue"} dir={sortDir} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort("riskScore")}>
                Risque <SortIcon active={sortKey === "riskScore"} dir={sortDir} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort("status")}>
                Statut <SortIcon active={sortKey === "status"} dir={sortDir} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:text-gray-900 select-none" onClick={() => toggleSort("lastReminderStep")}>
                Relances <SortIcon active={sortKey === "lastReminderStep"} dir={sortDir} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">À faire</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-gray-400 text-sm">
                  Aucune facture ne correspond aux filtres sélectionnés.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => {
                const canRelance = inv.status !== "paid" && inv.lastReminderStep < 4;
                const isLoading = loadingIds.has(inv.id);
                const action = ACTION_LABELS[inv.recommendedAction];
                return (
                  <tr key={inv.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedIds.has(inv.id) ? "bg-blue-50" : ""}`}>
                    <td className="px-4 py-3">
                      {canRelance && (
                        <input type="checkbox" checked={selectedIds.has(inv.id)} onChange={() => toggleSelect(inv.id)} className="rounded border-gray-300 text-blue-600" />
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
                      <RiskBadge score={inv.riskScore} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{inv.lastReminderStep}/4</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs flex items-center gap-1 whitespace-nowrap ${
                        inv.recommendedAction === "formal_notice" ? "text-red-600 font-medium" :
                        inv.recommendedAction === "call" ? "text-orange-600 font-medium" :
                        inv.recommendedAction === "in_progress" ? "text-blue-600" :
                        "text-gray-400"
                      }`}>
                        {action.icon} {action.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {canRelance && (
                          <button onClick={() => sendReminder(inv.id)} disabled={isLoading} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors">
                            {isLoading ? "..." : "Relancer"}
                          </button>
                        )}
                        {inv.status !== "paid" && (
                          <button onClick={() => markPaid(inv.id)} disabled={isLoading} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100 disabled:opacity-50 transition-colors">
                            Payée
                          </button>
                        )}
                        <button onClick={() => deleteInvoice(inv.id)} disabled={isLoading} className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors">✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
