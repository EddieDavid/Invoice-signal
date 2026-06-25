"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlanSelector({ currentPlan }: { currentPlan: string }) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(currentPlan);
  const router = useRouter();

  async function switchPlan(plan: string) {
    if (plan === selected) return;
    setLoading(true);
    const res = await fetch("/api/settings/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    if (res.ok) {
      setSelected(plan);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div id="plan" className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Plan</h2>
      <p className="text-sm text-gray-500 mb-5">
        Changez votre plan pour accéder aux fonctionnalités avancées (score de risque, fiches clients, personnalisation IA).
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => switchPlan("starter")}
          disabled={loading}
          className={`rounded-xl border-2 p-4 text-left transition-all ${
            selected === "starter"
              ? "border-violet-500 bg-violet-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="font-semibold text-gray-900 mb-1">Starter</div>
          <div className="text-xs text-gray-500">Tableau de bord, relances, import CSV</div>
          {selected === "starter" && (
            <div className="mt-2 text-xs font-semibold text-violet-600">Plan actuel</div>
          )}
        </button>
        <button
          onClick={() => switchPlan("pro")}
          disabled={loading}
          className={`rounded-xl border-2 p-4 text-left transition-all ${
            selected === "pro"
              ? "border-violet-500 bg-violet-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            Pro <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">✨</span>
          </div>
          <div className="text-xs text-gray-500">Score de risque, fiches clients, IA</div>
          {selected === "pro" && (
            <div className="mt-2 text-xs font-semibold text-violet-600">Plan actuel</div>
          )}
        </button>
      </div>
    </div>
  );
}
