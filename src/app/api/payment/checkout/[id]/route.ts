import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${id}`
    );
  }

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: Math.round(invoice.amount * 100),
          product_data: {
            name: `Facture ${invoice.invoiceNumber}`,
            description: `Règlement — ${invoice.clientName}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { invoiceId: invoice.id },
    success_url: `${baseUrl}/pay/${invoice.id}?success=true`,
    cancel_url: `${baseUrl}/pay/${invoice.id}?cancelled=true`,
  });

  return NextResponse.redirect(session.url!);
}
