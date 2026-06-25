import Link from "next/link";

export default function CguPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-violet-600 hover:underline mb-8 inline-block">← Retour à l'accueil</Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-slate-500 text-sm mb-10">En vigueur à compter du 1er juin 2026</p>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Objet</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du service InvoiceSignal, plateforme SaaS de gestion et d'automatisation des relances de factures impayées, éditée par Eddie David YEDE NKA (micro-entrepreneur, SIRET 923 524 631 00010).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">2. Accès au service</h2>
          <p className="text-slate-600 leading-relaxed">
            L'accès au service est réservé aux professionnels (TPE, PME, indépendants). L'utilisateur doit créer un compte avec une adresse email valide et un mot de passe. Il est responsable de la confidentialité de ses identifiants.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">3. Description du service</h2>
          <p className="text-slate-600 leading-relaxed mb-3">InvoiceSignal permet de :</p>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li>Importer et gérer des factures clients</li>
            <li>Envoyer des séquences d'emails de relance automatisée</li>
            <li>Suivre le statut de paiement des factures</li>
            <li>Accéder à des indicateurs de risque et historiques clients (plan Pro)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">4. Plans et tarification</h2>
          <p className="text-slate-600 leading-relaxed mb-3">
            InvoiceSignal propose deux niveaux d'accès :
          </p>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li><strong>Plan Starter :</strong> accès aux fonctionnalités de base (tableau de bord, relances, import CSV)</li>
            <li><strong>Plan Pro :</strong> accès à toutes les fonctionnalités (score de risque, fiches clients, personnalisation IA)</li>
          </ul>
          <p className="text-slate-600 leading-relaxed mt-3">
            Les tarifs en vigueur sont communiqués lors de la souscription. Tout paiement effectué est définitif et non remboursable, sauf disposition légale contraire.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">5. Obligations de l'utilisateur</h2>
          <p className="text-slate-600 leading-relaxed mb-3">L'utilisateur s'engage à :</p>
          <ul className="list-disc pl-5 text-slate-600 space-y-2">
            <li>Utiliser le service uniquement pour des créances légitimes et dans le cadre de son activité professionnelle</li>
            <li>Ne pas envoyer de communications frauduleuses, mensongères ou harcelantes via la plateforme</li>
            <li>Respecter la réglementation applicable aux communications commerciales et à la protection des données (RGPD)</li>
            <li>Ne pas tenter de contourner les mesures de sécurité de la plateforme</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">6. Responsabilité</h2>
          <p className="text-slate-600 leading-relaxed">
            InvoiceSignal est un outil d'aide à la gestion. L'éditeur ne saurait être tenu responsable des conséquences des emails envoyés par l'utilisateur à ses propres clients, ni du non-recouvrement des créances. L'utilisateur reste seul responsable de l'exactitude des données importées.
          </p>
          <p className="text-slate-600 leading-relaxed mt-3">
            L'éditeur s'engage à mettre en œuvre tous les moyens raisonnables pour assurer la disponibilité du service, sans garantir une disponibilité à 100%.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">7. Données personnelles</h2>
          <p className="text-slate-600 leading-relaxed">
            Le traitement des données personnelles est décrit dans notre{" "}
            <Link href="/politique-de-confidentialite" className="text-violet-600 hover:underline">
              Politique de confidentialité
            </Link>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">8. Résiliation</h2>
          <p className="text-slate-600 leading-relaxed">
            L'utilisateur peut résilier son compte à tout moment en contactant{" "}
            <a href="mailto:contact@invoicesignal.io" className="text-violet-600 hover:underline">contact@invoicesignal.io</a>.
            L'éditeur se réserve le droit de suspendre ou supprimer un compte en cas de violation des présentes CGU, sans préavis ni remboursement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">9. Droit applicable</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux compétents du ressort de Bobigny seront saisis.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">10. Contact</h2>
          <p className="text-slate-600 leading-relaxed">
            Pour toute question relative aux présentes CGU :{" "}
            <a href="mailto:contact@invoicesignal.io" className="text-violet-600 hover:underline">contact@invoicesignal.io</a>
          </p>
        </section>

        <p className="text-sm text-slate-400 mt-12">Dernière mise à jour : juin 2026</p>
      </div>
    </div>
  );
}
