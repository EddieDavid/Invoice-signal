export type RiskScore = "green" | "yellow" | "red";
export type ClientRiskScore = "green" | "yellow" | "red" | "no_history";
export type RecommendedAction = "none" | "in_progress" | "call" | "formal_notice";

export interface ClientHistory {
  totalInvoices: number;
  invoicesWithReminders: number;
}

export interface ScoredInvoice {
  riskScore: RiskScore;
  recommendedAction: RecommendedAction;
}

export interface ClientScoreInput {
  totalPaidInvoices: number;
  paidLateCount: number;       // paid invoices with reminder step > 0
  avgDaysLate: number;         // avg (updatedAt - dueDate) in days for paid invoices
  hasUnpaidOldInvoice: boolean; // any unpaid invoice >60 days overdue
}

export interface DegradationResult {
  isDegrading: boolean;
  extraDays: number;
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

  let riskScore: RiskScore;
  if (daysOverdue > 30 || lastReminderStep >= 3 || isRepeatLatePayer) {
    riskScore = "red";
  } else if (daysOverdue > 5 || lastReminderStep >= 1) {
    riskScore = "yellow";
  } else {
    riskScore = "green";
  }

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

export function scoreClient(input: ClientScoreInput): ClientRiskScore {
  if (input.totalPaidInvoices === 0) return "no_history";
  const lateRate = input.paidLateCount / input.totalPaidInvoices;
  if (lateRate > 0.5 || input.avgDaysLate > 20 || input.hasUnpaidOldInvoice) return "red";
  if (lateRate >= 0.2 || input.avgDaysLate > 5) return "yellow";
  return "green";
}

// allPaidDaysLate: sorted oldest→newest by payment date (updatedAt - dueDate in days)
export function detectDegradation(
  allPaidDaysLate: number[],
  totalInvoices: number
): DegradationResult {
  if (totalInvoices < 4 || allPaidDaysLate.length < 3) {
    return { isDegrading: false, extraDays: 0 };
  }
  const historicalAvg = allPaidDaysLate.reduce((a, b) => a + b, 0) / allPaidDaysLate.length;
  const recent3 = allPaidDaysLate.slice(-3);
  const recentAvg = recent3.reduce((a, b) => a + b, 0) / 3;
  const extraDays = Math.round(recentAvg - historicalAvg);
  return { isDegrading: extraDays >= 10, extraDays };
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

export const CLIENT_RISK_LABELS: Record<ClientRiskScore, { label: string; className: string; dot: string }> = {
  green: { label: "Fiable", className: "bg-green-100 text-green-700", dot: "bg-green-500" },
  yellow: { label: "À surveiller", className: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  red: { label: "À risque", className: "bg-red-100 text-red-700", dot: "bg-red-500" },
  no_history: { label: "Pas d'historique", className: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
};
