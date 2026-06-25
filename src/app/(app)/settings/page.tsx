import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import SettingsForm from "@/components/SettingsForm";
import PlanSelector from "@/components/PlanSelector";
import { DEFAULT_TEMPLATES } from "@/lib/templates";

export default async function SettingsPage() {
  const { companyId } = await requireAuth();
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { plan: true } });
  const plan = company?.plan ?? "starter";

  for (const tpl of DEFAULT_TEMPLATES) {
    await prisma.emailTemplate.upsert({
      where: { companyId_step: { companyId, step: tpl.step } },
      create: { companyId, ...tpl },
      update: {},
    });
  }

  const templates = await prisma.emailTemplate.findMany({
    where: { companyId },
    orderBy: { step: "asc" },
  });

  let settings = await prisma.settings.findUnique({ where: { companyId } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { companyId, reminderInterval: 5 } });
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">
          Personnalisez vos emails de relance et les délais entre envois.
        </p>
      </div>
      <SettingsForm templates={templates} interval={settings.reminderInterval} paymentInfo={settings.paymentInfo ?? ""} />
      <PlanSelector currentPlan={plan} />
    </div>
  );
}
