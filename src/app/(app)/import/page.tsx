"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      alert("Veuillez choisir un fichier .csv");
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/invoices/import", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);
    if (data.imported > 0) {
      router.push(`/resume?imported=${data.imported}`);
      return;
    }
    setResult(data);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Importer un fichier CSV</h1>
        <p className="text-gray-500 text-sm mt-1">
          Importez vos factures impayées depuis un tableau Excel ou CSV.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-medium text-gray-900 mb-2">Format attendu</h2>
        <p className="text-sm text-gray-500 mb-3">
          Votre fichier CSV doit contenir ces colonnes (dans cet ordre) :
        </p>
        <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-700 overflow-x-auto">
          nom_client,email_client,numero_facture,montant,date_echeance
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Format de la date : JJ/MM/AAAA (ex : 15/01/2024)
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`bg-white rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
        }`}
      >
        <p className="text-4xl mb-3">📂</p>
        <p className="font-medium text-gray-700">Glissez votre fichier CSV ici</p>
        <p className="text-gray-400 text-sm mt-1 mb-4">ou</p>
        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Choisir un fichier
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>

      {loading && (
        <div className="mt-4 bg-blue-50 rounded-xl p-4 text-center text-blue-700 text-sm">
          Import en cours...
        </div>
      )}

      {result && (
        <div className={`mt-4 rounded-xl p-4 ${result.imported > 0 ? "bg-green-50" : "bg-red-50"}`}>
          {result.imported > 0 && (
            <p className="text-green-700 font-medium text-sm mb-2">
              ✅ {result.imported} facture(s) importée(s) avec succès !
            </p>
          )}
          {result.errors.length > 0 && (
            <div>
              <p className="text-red-600 font-medium text-sm mb-1">
                {result.errors.length} ligne(s) ignorée(s) :
              </p>
              <ul className="text-red-500 text-xs space-y-0.5">
                {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}
          {result.imported > 0 && (
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-3 bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Voir le dashboard →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
