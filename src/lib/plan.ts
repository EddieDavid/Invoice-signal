import { prisma } from "./prisma";

export async function getCompanyPlan(companyId: string): Promise<"starter" | "pro"> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { plan: true },
  });
  return (company?.plan ?? "starter") as "starter" | "pro";
}

export function isPro(plan: string): boolean {
  return plan === "pro";
}
