"use client";

import { useState } from "react";

export default function ClientDelayInput({
  clientEmail,
  initialInterval,
}: {
  clientEmail: string;
  initialInterval: number | null;
}) {
  const [value, setValue] = useState(initialInterval !== null ? String(initialInterval) : "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch(`/api/clients/${encodeURIComponent(clientEmail)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customReminderInterval: value === "" ? null : Number(value) }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        max="365"
        placeholder="Défaut"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
      />
      <span className="text-xs text-gray-400">j</span>
      <button
        onClick={save}
        disabled={loading}
        className="text-xs text-violet-600 hover:text-violet-800 font-medium disabled:opacity-50"
      >
        {saved ? "✓" : "Sauv."}
      </button>
    </div>
  );
}
