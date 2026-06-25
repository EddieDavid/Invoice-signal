"use client";

import { useState } from "react";

type Template = {
  id: string;
  step: number;
  subject: string;
  body: string;
};

const STEP_LABELS = ["", "1er rappel (courtois)", "2e relance", "3e relance (ferme)", "Mise en demeure"];

export default function SettingsForm({
  templates,
  interval,
  paymentInfo,
}: {
  templates: Template[];
  interval: number;
  paymentInfo: string;
}) {
  const [localTemplates, setLocalTemplates] = useState(templates);
  const [localInterval, setLocalInterval] = useState(interval);
  const [localPaymentInfo, setLocalPaymentInfo] = useState(paymentInfo);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(1);

  function updateTemplate(step: number, field: "subject" | "body", value: string) {
    setLocalTemplates((prev) =>
      prev.map((t) => (t.step === step ? { ...t, [field]: value } : t))
    );
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templates: localTemplates, interval: localInterval, paymentInfo: localPaymentInfo }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const activeTemplate = localTemplates.find((t) => t.step === activeTab);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-medium text-gray-900 mb-1">Coordonnées bancaires</h2>
        <p className="text-xs text-gray-400 mb-3">
          Apparaît dans vos emails de relance via la variable{" "}
          <code className="bg-gray-100 px-1 rounded">{"{coordonnees_bancaires}"}</code>.
          Indiquez votre IBAN, BIC, ou tout autre moyen de paiement accepté.
        </p>
        <textarea
          value={localPaymentInfo}
          onChange={(e) => setLocalPaymentInfo(e.target.value)}
          rows={4}
          placeholder={"Pour régler cette facture par virement :\nIBAN : FR76 XXXX XXXX XXXX XXXX XXXX XXX\nBIC : XXXXXXXX\nBanque : Nom de votre banque"}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-medium text-gray-900 mb-3">Délai entre les relances</h2>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={30}
            value={localInterval}
            onChange={(e) => setLocalInterval(Number(e.target.value))}
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-600 text-sm">jours entre chaque relance</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Exemple : 5 jours → relances envoyées à J+5, J+10, J+15, J+20 après l'échéance.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-100 flex">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              onClick={() => setActiveTab(step)}
              className={`flex-1 py-3 px-2 text-xs font-medium transition-colors ${
                activeTab === step
                  ? "text-blue-700 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {STEP_LABELS[step]}
            </button>
          ))}
        </div>

        {activeTemplate && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objet de l'email</label>
              <input
                type="text"
                value={activeTemplate.subject}
                onChange={(e) => updateTemplate(activeTab, "subject", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Corps de l'email</label>
              <textarea
                value={activeTemplate.body}
                onChange={(e) => updateTemplate(activeTab, "body", e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-400">
              Variables disponibles :{" "}
              <code className="bg-gray-100 px-1 rounded">{"{nom_client}"}</code>{" "}
              <code className="bg-gray-100 px-1 rounded">{"{montant}"}</code>{" "}
              <code className="bg-gray-100 px-1 rounded">{"{numero_facture}"}</code>{" "}
              <code className="bg-gray-100 px-1 rounded">{"{jours_retard}"}</code>{" "}
              <code className="bg-gray-100 px-1 rounded">{"{lien_paiement}"}</code>{" "}
              <code className="bg-gray-100 px-1 rounded">{"{coordonnees_bancaires}"}</code>
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {saved && <span className="text-green-600 text-sm">✅ Enregistré !</span>}
      </div>
    </div>
  );
}
