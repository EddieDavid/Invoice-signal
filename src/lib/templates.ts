export const DEFAULT_TEMPLATES = [
  {
    step: 1,
    subject: "Rappel : Facture {numero_facture} en attente de règlement",
    body: `Bonjour {nom_client},

Nous vous contactons afin de vous rappeler que la facture n°{numero_facture} d'un montant de {montant} € est arrivée à échéance depuis {jours_retard} jour(s).

Si vous avez déjà effectué ce paiement, veuillez ignorer ce message.

{coordonnees_bancaires}

Cordialement,
L'équipe comptable`,
  },
  {
    step: 2,
    subject: "Relance : Facture {numero_facture} toujours impayée",
    body: `Bonjour {nom_client},

Sauf erreur de notre part, la facture n°{numero_facture} d'un montant de {montant} € reste impayée depuis {jours_retard} jour(s).

Nous vous remercions de bien vouloir régulariser cette situation dans les meilleurs délais.

{coordonnees_bancaires}

Cordialement,
L'équipe comptable`,
  },
  {
    step: 3,
    subject: "URGENT : Facture {numero_facture} — règlement requis",
    body: `Bonjour {nom_client},

Malgré nos précédents rappels, la facture n°{numero_facture} d'un montant de {montant} € demeure impayée depuis {jours_retard} jour(s).

Nous vous demandons de procéder au règlement de cette somme sous 48 heures.

Sans retour de votre part, nous serons contraints d'engager une procédure de recouvrement.

{coordonnees_bancaires}

Cordialement,
L'équipe comptable`,
  },
  {
    step: 4,
    subject: "Mise en demeure : Facture {numero_facture}",
    body: `Bonjour {nom_client},

Par la présente, nous vous mettons en demeure de régler la facture n°{numero_facture} d'un montant de {montant} €, en retard de {jours_retard} jour(s).

À défaut de paiement sous 72 heures, nous transmettrons ce dossier à notre service contentieux.

{coordonnees_bancaires}

Cordialement,
L'équipe comptable`,
  },
];

export function applyTemplate(
  template: string,
  vars: {
    nom_client: string;
    montant: string;
    numero_facture: string;
    jours_retard: string;
    lien_paiement: string;
    coordonnees_bancaires?: string;
  }
): string {
  return template
    .replace(/{nom_client}/g, vars.nom_client)
    .replace(/{montant}/g, vars.montant)
    .replace(/{numero_facture}/g, vars.numero_facture)
    .replace(/{jours_retard}/g, vars.jours_retard)
    .replace(/{lien_paiement}/g, vars.lien_paiement)
    .replace(/{coordonnees_bancaires}/g, vars.coordonnees_bancaires ?? "");
}
