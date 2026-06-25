import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}>
            <span className="text-white text-xs font-bold">IS</span>
          </div>
          <span className="font-bold text-slate-900 text-lg">InvoiceSignal</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-medium">
          <a href="#fonctionnalites" className="hover:text-slate-800 transition-colors">Fonctionnalités</a>
          <a href="#comment" className="hover:text-slate-800 transition-colors">Comment ça marche</a>
          <a href="#tarifs" className="hover:text-slate-800 transition-colors">Tarifs</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/connexion" className="text-sm text-slate-500 font-medium hover:text-slate-800 transition-colors">
            Se connecter
          </Link>
          <Link href="/inscription" className="text-sm font-semibold text-white px-5 py-2.5 rounded-full transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}>
            Essayer gratuitement
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-24 flex items-center gap-12 relative">
        {/* Blob décoratif */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "#6C63FF" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5 blur-2xl pointer-events-none" style={{ background: "#f59e0b" }} />

        {/* Texte gauche */}
        <div className="flex-1 max-w-xl">
          <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full mb-6 text-violet-700" style={{ background: "#ede9fe" }}>
            Pour les dirigeants de TPE/PME
          </span>
          <h1 className="text-5xl font-extrabold leading-tight mb-6" style={{ color: "#1a1a4e" }}>
            Récupérez vos<br />impayés sans<br />lever le petit doigt
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-8">
            InvoiceSignal relance automatiquement vos clients — du rappel courtois à la mise en demeure — et identifie vos factures à risque en un coup d'œil.
          </p>
          <div className="flex items-center gap-4 mb-6">
            <Link href="/inscription" className="text-sm font-semibold text-white px-7 py-3.5 rounded-full transition-all hover:opacity-90 hover:shadow-xl"
              style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}>
              Essayer gratuitement →
            </Link>
          </div>
          <p className="text-sm text-slate-400">
            Déjà inscrit ?{" "}
            <Link href="/connexion" className="font-semibold hover:underline" style={{ color: "#6C63FF" }}>
              Se connecter
            </Link>
          </p>
        </div>

        {/* Illustration droite — mini mockup dashboard */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative w-[420px]">
            {/* Blob derrière */}
            <div className="absolute inset-0 rounded-3xl opacity-20 blur-xl" style={{ background: "linear-gradient(135deg, #6C63FF, #a78bfa)" }} />
            {/* Card principale */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 overflow-hidden">
              {/* Mini header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-auto text-xs text-slate-400">invoicesignal.io</div>
              </div>
              {/* Titre */}
              <div className="h-4 bg-slate-900 rounded w-32 mb-4" />
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[["12 400 €", "bg-red-50", "text-red-600"], ["3 200 €", "bg-amber-50", "text-amber-600"], ["4", "bg-green-50", "text-green-600"]].map(([val, bg, text], i) => (
                  <div key={i} className={`${bg} rounded-xl p-3`}>
                    <div className="h-2 bg-slate-200 rounded w-12 mb-2" />
                    <div className={`text-sm font-bold ${text}`}>{val}</div>
                  </div>
                ))}
              </div>
              {/* Lignes tableau */}
              {[
                { risk: "bg-red-500", name: "Dupont BTP", amount: "4 200 €", badge: "bg-red-100 text-red-600" },
                { risk: "bg-amber-400", name: "Martin SAS", amount: "2 800 €", badge: "bg-amber-100 text-amber-600" },
                { risk: "bg-green-500", name: "Legrand & Co", amount: "1 400 €", badge: "bg-green-100 text-green-600" },
                { risk: "bg-amber-400", name: "Roux Immobilier", amount: "3 000 €", badge: "bg-amber-100 text-amber-600" },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50">
                  <div className={`w-2 h-2 rounded-full ${row.risk} flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-700">{row.name}</div>
                  </div>
                  <div className="text-xs font-semibold text-slate-700">{row.amount}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.badge}`}>Relancer</span>
                </div>
              ))}
            </div>
            {/* Badge flottant */}
            <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-3 border border-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-base">✓</div>
              <div>
                <div className="text-xs font-bold text-slate-800">Relance envoyée</div>
                <div className="text-xs text-slate-400">il y a 2 min</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="py-24" style={{ background: "#f8f7ff" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-16">
          {/* Illustration gauche */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full opacity-20" style={{ background: "#6C63FF" }} />
              <div className="absolute inset-8 rounded-full opacity-30" style={{ background: "#6C63FF" }} />
              <div className="absolute inset-0 flex items-center justify-center text-8xl">📊</div>
              {/* Éléments flottants */}
              <div className="absolute top-4 right-0 bg-white rounded-xl shadow-lg p-3 text-xs font-semibold text-slate-700">
                🟢 Risque faible
              </div>
              <div className="absolute bottom-8 left-0 bg-white rounded-xl shadow-lg p-3 text-xs font-semibold text-red-600">
                ⚠️ Mise en demeure
              </div>
            </div>
          </div>

          {/* Grille fonctionnalités */}
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold mb-2" style={{ color: "#1a1a4e" }}>Nos fonctionnalités</h2>
            <p className="text-slate-400 mb-10">Plus intelligent, plus rapide, plus efficace.</p>
            <div className="grid grid-cols-2 gap-6">
              {[
                {
                  icon: "📧",
                  bg: "linear-gradient(135deg, #6C63FF, #4f46e5)",
                  title: "Relances automatiques",
                  desc: "4 emails progressifs — du rappel courtois à la mise en demeure — envoyés aux bons moments.",
                },
                {
                  icon: "🎯",
                  bg: "linear-gradient(135deg, #ec4899, #db2777)",
                  title: "Score de risque",
                  desc: "Chaque facture reçoit un score Vert/Jaune/Rouge selon le retard et l'historique client.",
                },
                {
                  icon: "🤖",
                  bg: "linear-gradient(135deg, #10b981, #059669)",
                  title: "IA intégrée",
                  desc: "L'intelligence artificielle adapte le ton de chaque relance selon le profil du client.",
                },
                {
                  icon: "📥",
                  bg: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                  title: "Import CSV simple",
                  desc: "Déposez votre fichier Excel ou CSV. Toutes vos factures sont importées en quelques secondes.",
                },
              ].map((f) => (
                <div key={f.title} className="bg-white rounded-2xl p-5 shadow-sm border border-white hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background: f.bg }}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-3" style={{ color: "#1a1a4e" }}>Comment ça marche</h2>
          <p className="text-slate-400 text-center mb-14">Opérationnel en moins de 5 minutes.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Importez vos factures", desc: "Déposez votre fichier CSV ou Excel. InvoiceSignal importe toutes vos factures impayées en quelques secondes.", color: "#6C63FF" },
              { num: "02", title: "Les relances partent seules", desc: "4 emails progressifs s'envoient automatiquement à vos clients — du rappel courtois à la mise en demeure.", color: "#ec4899" },
              { num: "03", title: "Vous suivez en temps réel", desc: "Le dashboard vous indique QUI doit de l'argent, DEPUIS COMBIEN DE TEMPS, et QUELLE ACTION entreprendre.", color: "#10b981" },
            ].map((step) => (
              <div key={step.num} className="relative">
                <div className="text-6xl font-extrabold opacity-10 mb-3 leading-none" style={{ color: step.color }}>{step.num}</div>
                <div className="w-10 h-1 rounded-full mb-4" style={{ background: step.color }} />
                <h3 className="font-bold text-slate-800 text-lg mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="py-24" style={{ background: "#f8f7ff" }}>
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-3" style={{ color: "#1a1a4e" }}>Tarifs simples</h2>
          <p className="text-slate-400 text-center mb-14">Pas de frais cachés. Résiliable à tout moment.</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-xl mb-1">Starter</h3>
              <p className="text-slate-400 text-sm mb-6">Pour les petites structures</p>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-5xl font-extrabold" style={{ color: "#1a1a4e" }}>79€</span>
                <span className="text-slate-400 text-sm mb-2">/mois</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 mb-8">
                {["Jusqu'à 20 factures actives", "4 emails de relance par facture", "Score de risque Vert/Jaune/Rouge", "Support par email"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/inscription" className="block text-center py-3 rounded-full font-semibold text-sm border-2 transition-all hover:opacity-90" style={{ borderColor: "#6C63FF", color: "#6C63FF" }}>
                Commencer
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 shadow-lg relative overflow-hidden" style={{ borderColor: "#6C63FF" }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8" style={{ background: "#6C63FF" }} />
              <span className="absolute top-5 right-5 text-xs font-bold text-white px-3 py-1 rounded-full" style={{ background: "#6C63FF" }}>
                Populaire
              </span>
              <h3 className="font-bold text-slate-800 text-xl mb-1">Pro</h3>
              <p className="text-slate-400 text-sm mb-6">Pour les PME en croissance</p>
              <div className="mb-6 flex items-end gap-1">
                <span className="text-5xl font-extrabold" style={{ color: "#1a1a4e" }}>149€</span>
                <span className="text-slate-400 text-sm mb-2">/mois</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 mb-8">
                {["Volume de factures illimité", "4 emails de relance par facture", "Score de risque + IA intégrée", "Templates d'emails personnalisés", "Fiches clients avec historique", "Support prioritaire"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/inscription" className="block text-center py-3 rounded-full font-semibold text-sm text-white transition-all hover:opacity-90 hover:shadow-lg" style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}>
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #6C63FF, #4f46e5)" }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Prêt à récupérer vos impayés ?
          </h2>
          <p className="text-violet-200 mb-8 text-lg">
            Créez votre compte en 2 minutes. Aucune carte bancaire requise.
          </p>
          <Link href="/inscription" className="inline-block bg-white font-bold px-8 py-4 rounded-full transition-all hover:shadow-xl hover:scale-105 text-sm" style={{ color: "#6C63FF" }}>
            Essayer gratuitement →
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-slate-400">
          © 2026 InvoiceSignal — Assistant de recouvrement intelligent pour TPE/PME
        </div>
      </footer>
    </div>
  );
}
