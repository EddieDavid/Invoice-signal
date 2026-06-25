"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BulkRelanceButton({ invoiceIds }: { invoiceIds: string[] }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  if (invoiceIds.length === 0) {
    return (
      <span className="inline-block text-sm text-gray-400 px-6 py-3">
        Aucune relance à envoyer pour le moment
      </span>
    );
  }

  async function handleClick() {
    setLoading(true);
    let sent = 0;
    for (const id of invoiceIds) {
      await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: id }),
      });
      sent++;
      setProgress(Math.round((sent / invoiceIds.length) * 100));
    }
    setLoading(false);
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-100 px-6 py-3 rounded-full">
        ✓ {invoiceIds.length} relance{invoiceIds.length > 1 ? "s" : ""} envoyée{invoiceIds.length > 1 ? "s" : ""}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-full transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-70"
      style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}
    >
      {loading ? (
        <>
          <span className="animate-spin">⟳</span>
          Envoi en cours… {progress}%
        </>
      ) : (
        <>⚡ Lancer les relances maintenant ({invoiceIds.length})</>
      )}
    </button>
  );
}
