import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-violet-600 hover:underline mb-8 inline-block">← Retour à l'accueil</Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-10">Mentions légales</h1>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Éditeur du site</h2>
          <p className="text-slate-600 leading-relaxed">
            <strong>Eddie David YEDE NKA</strong><br />
            Micro-entrepreneur<br />
            SIRET : 923 524 631 00010<br />
            11 RUE OUM KALSOUM, 93000 BOBIGNY, France<br />
            Email : <a href="mailto:contact@invoicesignal.io" className="text-violet-600 hover:underline">contact@invoicesignal.io</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Directeur de la publication</h2>
          <p className="text-slate-600">Eddie David YEDE NKA</p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Hébergement</h2>
          <p className="text-slate-600 leading-relaxed">
            <strong>Vercel Inc.</strong><br />
            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
            Site : <a href="https://vercel.com" className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a>
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            <strong>Supabase Inc.</strong> (base de données)<br />
            Région : Europe (AWS eu-west-2)<br />
            Site : <a href="https://supabase.com" className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">supabase.com</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Propriété intellectuelle</h2>
          <p className="text-slate-600 leading-relaxed">
            L'ensemble du contenu du site InvoiceSignal (textes, images, interface) est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans l'accord préalable écrit de l'éditeur.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            Ce site utilise des cookies techniques nécessaires à son fonctionnement (session d'authentification) et des cookies d'analyse anonymisée via PostHog pour améliorer l'expérience utilisateur. Aucun cookie publicitaire n'est utilisé.
          </p>
        </section>

        <p className="text-sm text-slate-400 mt-12">Dernière mise à jour : juin 2026</p>
      </div>
    </div>
  );
}
