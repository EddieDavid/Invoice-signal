import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  const company = await prisma.company.findUnique({ where: { id: session.companyId } });
  const isDemoMode = !process.env.RESEND_API_KEY;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">IS</span>
            </div>
            <span className="font-bold text-gray-900 truncate text-sm">{company?.name ?? "InvoiceSignal"}</span>
          </div>
          {isDemoMode && (
            <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              Mode démo
            </span>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <span>📊</span> Dashboard
          </Link>
          <Link href="/import" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <span>📥</span> Importer un CSV
          </Link>
          {isDemoMode && (
            <Link href="/inbox" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
              <span>📬</span> Boîte simulée
            </Link>
          )}
          <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
            <span>⚙️</span> Paramètres
          </Link>
        </nav>

        <div className="p-3 border-t border-gray-100">
          <LogoutButton />
        </div>
      </aside>

      <main className="ml-56 flex-1 p-6">{children}</main>
    </div>
  );
}
