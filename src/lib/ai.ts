interface PersonalizeOptions {
  templateBody: string;
  step: number;
  daysOverdue: number;
  amount: number;
  clientName: string;
  invoiceNumber: string;
  invoicesWithReminders: number;
  totalInvoices: number;
}

export async function personalizeReminderEmail(opts: PersonalizeOptions): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return opts.templateBody;

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: key });

    const isRepeatPayer = opts.invoicesWithReminders >= 2;
    const historyNote = isRepeatPayer
      ? `Ce client a un historique de retards répétés (${opts.invoicesWithReminders} factures relancées sur ${opts.totalInvoices}).`
      : `Ce client paie généralement à temps.`;

    const prompt = `Tu es un assistant de recouvrement professionnel pour une PME française.
Voici le contexte de cette relance :
- Relance numéro : ${opts.step}/4
- Retard de paiement : ${opts.daysOverdue} jours
- Montant dû : ${opts.amount.toFixed(2)}€
- Client : ${opts.clientName}
- Facture : ${opts.invoiceNumber}
- ${historyNote}

Voici l'email de relance actuel (template) :
---
${opts.templateBody}
---

Réécris uniquement le corps de cet email en adaptant légèrement le ton : plus courtois et patient pour une 2e relance, plus ferme pour une 3e, très sérieux et professionnel pour une 4e.
Règles absolues :
- Garde tous les liens, montants, numéros de facture et coordonnées exactement tels quels.
- Ne change pas la structure générale (salutation, corps, signature).
- Reste professionnel et respectueux, jamais agressif.
- Réponds uniquement avec le corps de l'email, sans explication.
- Longueur similaire au template original.`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type === "text" && content.text.trim()) {
      return content.text.trim();
    }
    return opts.templateBody;
  } catch {
    return opts.templateBody;
  }
}
