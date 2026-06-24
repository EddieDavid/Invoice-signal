import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">IS</span>
            </div>
            <span className="font-bold text-gray-900">InvoiceSignal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/connexion" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Essayer gratuitement
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          Pour les PME du BTP, de l'immobilier et du retail
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Récupérez vos impayés<br />sans lever le petit doigt
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          InvoiceSignal envoie automatiquement vos relances de factures — du rappel courtois à la mise en demeure — et encaisse le paiement en un clic.
        </p>
        <Link
          href="/inscription"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          Essayer gratuitement →
        </Link>
        <p className="text-sm text-gray-400 mt-4">Aucune carte bancaire requise. Compte actif en 2 minutes.</p>
      </section>

      {/* Comment ça marche */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Comment ça marche
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                title: "Importez vos factures",
                desc: "Déposez votre fichier Excel ou CSV. InvoiceSignal importe toutes vos factures impayées en quelques secondes.",
              },
              {
                num: "2",
                title: "Les relances partent automatiquement",
                desc: "4 emails progressifs — rappel courtois, relance, ferme, mise en demeure — s'envoient à vos clients aux bons intervalles.",
              },
              {
                num: "3",
                title: "Votre client paie en un clic",
                desc: "Chaque email contient un lien de paiement sécurisé. La facture se marque payée automatiquement dès la transaction.",
              },
            ].map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold">{step.num}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Tarifs simples</h2>
        <p className="text-gray-500 text-center mb-12">Pas de frais cachés. Résiliable à tout moment.</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="border border-gray-200 rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Starter</h3>
            <p className="text-gray-500 text-sm mb-6">Pour les petites structures</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">79€</span>
              <span className="text-gray-400 text-sm">/mois</span>
            </div>
            <ul className="space-y-3 text-sm text-gray-600 mb-8">
              {["Jusqu'à 20 factures actives", "4 emails de relance par facture", "Paiement en ligne intégré", "Support par email"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/inscription" className="block text-center border border-blue-600 text-blue-600 py-2.5 rounded-xl font-medium hover:bg-blue-50 transition-colors">
              Commencer
            </Link>
          </div>

          <div className="border-2 border-blue-600 rounded-2xl p-8 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Populaire
            </span>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Pro</h3>
            <p className="text-gray-500 text-sm mb-6">Pour les PME en croissance</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">149€</span>
              <span className="text-gray-400 text-sm">/mois</span>
            </div>
            <ul className="space-y-3 text-sm text-gray-600 mb-8">
              {["Volume de factures illimité", "4 emails de relance par facture", "Paiement en ligne intégré", "Templates d'emails personnalisés", "Support prioritaire"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/inscription" className="block text-center bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Commencer
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Prêt à en finir avec les relances manuelles ?
          </h2>
          <p className="text-blue-100 mb-8">
            Créez votre compte en 2 minutes et testez l'application avec vos propres factures.
          </p>
          <Link href="/inscription" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
            Essayer gratuitement
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-400">
          © 2026 InvoiceSignal — Outil de relance de factures pour PME
        </div>
      </footer>
    </div>
  );
}
