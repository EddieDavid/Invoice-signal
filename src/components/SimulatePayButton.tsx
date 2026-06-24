"use client";

import { useState } from "react";

export default function SimulatePayButton({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  async function handlePay() {
    setLoading(true);
    await fetch(`/api/payment/${invoiceId}`, { method: "POST" });
    setPaid(true);
    setLoading(false);
  }

  if (paid) {
    return (
      <div className="text-center py-4">
        <p className="text-4xl mb-2">🎉</p>
        <p className="text-green-700 font-bold text-lg">Paiement simulé réussi !</p>
        <p className="text-gray-500 text-sm mt-1">La facture a été marquée comme payée.</p>
      </div>
    );
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold text-base hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "Traitement..." : "✓ Simuler le paiement réussi"}
    </button>
  );
}
