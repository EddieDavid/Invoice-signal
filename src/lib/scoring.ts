export type RiskScore = "green" | "yellow" | "red";
export type RecommendedAction = "none" | "in_progress" | "call" | "formal_notice";

export interface ClientHistory {
  totalInvoices: number;
  invoicesWithReminders: number;
}

export interface ScoredInvoice {
  riskScore: RiskScore;
  recommendedAction: RecommendedAction;
}

export function scoreInvoice(
  daysOverdue: number,
  lastReminderStep: number,
  status: string,
  clientHistory: ClientHistory
): ScoredInvoice {
  if (status === "paid") {
    return { riskScore: "green", recommendedAction: "none" };
  }

  const isRepeatLatePayer = clientHistory.invoicesWithReminders >= 2;

  // Risk score
  let riskScore: RiskScore;
  if (daysOverdue > 30 || lastReminderStep >= 3 || isRepeatLatePayer) {
    riskScore = "red";
  } else if (daysOverdue > 5 || lastReminderStep >= 1) {
    riskScore = "yellow";
  } else {
    riskScore = "green";
  }

  // Recommended action
  let recommendedAction: RecommendedAction;
  if (daysOverdue > 60 || lastReminderStep >= 4) {
    recommendedAction = "formal_notice";
  } else if (lastReminderStep >= 2) {
    recommendedAction = "call";
  } else if (daysOverdue > 0 || lastReminderStep >= 1) {
    recommendedAction = "in_progress";
  } else {
    recommendedAction = "none";
  }

  return { riskScore, recommendedAction };
}

export const ACTION_LABELS: Record<RecommendedAction, { icon: string; label: string }> = {
  none: { icon: "✓", label: "Aucune action" },
  in_progress: { icon: "📧", label: "Relance à envoyer" },
  call: { icon: "📞", label: "Appeler ce client" },
  formal_notice: { icon: "⚠️", label: "Mise en demeure" },
};

export const RISK_LABELS: Record<RiskScore, { label: string; className: string }> = {
  green: { label: "Faible", className: "bg-green-100 text-green-700" },
  yellow: { label: "Moyen", className: "bg-amber-100 text-amber-700" },
  red: { label: "Élevé", className: "bg-red-100 text-red-700" },
};
