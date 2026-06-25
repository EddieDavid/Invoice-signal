import { prisma } from "@/lib/prisma";
import AdminPanel from "@/components/AdminPanel";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || key !== adminSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-sm w-full">
          <p className="text-2xl mb-3">🔒</p>
          <p className="font-semibold text-gray-800 mb-1">Accès restreint</p>
          <p className="text-gray-400 text-sm">Ajoutez <code className="bg-gray-100 px-1 rounded text-xs">?key=VOTRE_CLE</code> à l'URL.</p>
        </div>
      </div>
    );
  }

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      createdAt: true,
      _count: { select: { invoices: true } },
    },
  });

  return <AdminPanel companies={companies} adminKey={key} />;
}
