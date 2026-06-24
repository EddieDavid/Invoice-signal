import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SimulatePayButton from "@/components/SimulatePayButton";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; cancelled?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  const invoice = await prisma.invoice.findUnique({ where: { id } });

  if (!invoice) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl font-bold">IS</span>
          </div>
          <span className="inline-block bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
            Page de paiement simulée (mode démo)
          </span>
          <h1 className="text-xl font-bold text-gray-900">Paiement de facture</h1>
        </div>

        {invoice.status === "paid" || success === "true" ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-green-700 font-medium text-lg">Paiement reçu, merci !</p>
            <p className="text-gray-400 text-sm mt-1">Votre règlement a bien été enregistré.</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Client</span>
                <span className="font-medium">{invoice.clientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Facture</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Échéance</span>
                <span className="font-medium">
                  {new Date(invoice.dueDate).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
                <span>Montant à régler</span>
                <span className="text-blue-600">
                  {invoice.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </span>
              </div>
            </div>

            <SimulatePayButton invoiceId={invoice.id} />

            <p className="text-xs text-gray-400 text-center mt-4">
              En production, cette page sera remplacée par Stripe Checkout.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
