"use client";

import { useState } from "react";

type Company = {
  id: string;
  name: string;
  email: string;
  plan: string;
  createdAt: Date;
  _count: { invoices: number };
};

export default function AdminPanel({ companies, adminKey }: { companies: Company[]; adminKey: string }) {
  const [plans, setPlans] = useState<Record<string, string>>(
    Object.fromEntries(companies.map((c) => [c.id, c.plan]))
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function togglePlan(companyId: string) {
    const current = plans[companyId];
    const next = current === "pro" ? "starter" : "pro";
    setLoading(companyId);

    const res = await fetch("/api/admin/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: adminKey, companyId, plan: next }),
    });

    if (res.ok) {
      setPlans((prev) => ({ ...prev, [companyId]: next }));
      setSaved(companyId);
      setTimeout(() => setSaved(null), 2000);
    }
    setLoading(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin — InvoiceSignal</h1>
          <p className="text-gray-500 text-sm mt-1">{companies.length} compte{companies.length > 1 ? "s" : ""} enregistré{companies.length > 1 ? "s" : ""}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Entreprise</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Factures</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Inscrit le</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Plan</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => {
                const plan = plans[company.id];
                const isPro = plan === "pro";
                return (
                  <tr key={company.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{company.name}</td>
                    <td className="px-4 py-3 text-gray-500">{company.email}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{company._count.invoices}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(company.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePlan(company.id)}
                        disabled={loading === company.id}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-50 ${
                          isPro
                            ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {loading === company.id
                          ? "..."
                          : saved === company.id
                          ? "✓ Sauvegardé"
                          : isPro
                          ? "✨ Pro"
                          : "Starter"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
