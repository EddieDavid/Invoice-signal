import Link from "next/link";

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-violet-600 hover:underline mb-8 inline-block">← Retour à l'accueil</Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Politique de confidentialité</h1>
        <p className="text-slate-500 text-sm mb-10">Conformément au Règlement Général sur la Protection des Données (RGPD)</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Responsable du traitement</h2>
          <p className="text-slate-600 leading-relaxed">
            Eddie David YEDE NKA — Micro-entrepreneur<br />
            SIRET : 923 524 631 00010<br />
            11 RUE OUM KALSOUM, 93000 BOBIGNY, France<br />
            Email : <a href="mailto:contact@invoicesignal.io" className="text-violet-600 hover:underline">contact@invoicesignal.io</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">2. Données collectées</h2>
          <p className="text-slate-600 leading-relaxed mb-3">InvoiceSignal collecte les données suivantes :</p>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li><strong>Compte utilisateur :</strong> nom de l'entreprise, adresse email, mot de passe (chiffré)</li>
            <li><strong>Données de facturation :</strong> noms et emails des clients, numéros de facture, montants, dates d'échéance</li>
            <li><strong>Données d'usage :</strong> pages visitées, actions réalisées (via PostHog, anonymisé)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">3. Finalités du traitement</h2>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li>Fourniture du service de relance automatique de factures</li>
            <li>Envoi d'emails de relance aux clients de l'utilisateur</li>
            <li>Amélioration du service via l'analyse anonymisée des usages</li>
            <li>Gestion du compte et de l'authentification</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">4. Base légale</h2>
          <p className="text-slate-600 leading-relaxed">
            Le traitement est fondé sur l'exécution du contrat (CGU acceptées lors de l'inscription) et l'intérêt légitime pour l'amélioration du service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Sous-traitants et transferts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-600 border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Prestataire</th>
                  <th className="text-left px-4 py-2 font-medium">Rôle</th>
                  <th className="text-left px-4 py-2 font-medium">Localisation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-2">Vercel Inc.</td>
                  <td className="px-4 py-2">Hébergement applicatif</td>
                  <td className="px-4 py-2">États-Unis (SCC)</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-2">Supabase</td>
                  <td className="px-4 py-2">Base de données</td>
                  <td className="px-4 py-2">Europe (AWS eu-west-2)</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-2">Resend</td>
                  <td className="px-4 py-2">Envoi d'emails</td>
                  <td className="px-4 py-2">États-Unis (SCC)</td>
                </tr>
                <tr className="border-t border-slate-200">
                  <td className="px-4 py-2">PostHog</td>
                  <td className="px-4 py-2">Analyse d'usage</td>
                  <td className="px-4 py-2">Europe (EU Cloud)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2">SCC = Clauses contractuelles standard approuvées par la Commission européenne</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Durée de conservation</h2>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li><strong>Données de compte :</strong> durée de vie du compte + 3 ans après résiliation</li>
            <li><strong>Données de facturation :</strong> 10 ans (obligation comptable légale)</li>
            <li><strong>Données d'analyse :</strong> 12 mois</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Vos droits</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            Conformément au RGPD, vous disposez des droits suivants : accès, rectification, suppression, portabilité, limitation et opposition au traitement.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Pour exercer vos droits, contactez-nous à :{" "}
            <a href="mailto:contact@invoicesignal.io" className="text-violet-600 hover:underline">contact@invoicesignal.io</a>.
            Vous pouvez également introduire une réclamation auprès de la <a href="https://www.cnil.fr" className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">CNIL</a>.
          </p>
        </section>

        <p className="text-sm text-slate-400 mt-12">Dernière mise à jour : juin 2026</p>
      </div>
    </div>
  );
}
