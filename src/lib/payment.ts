export function getPaymentLink(invoiceId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!process.env.STRIPE_SECRET_KEY) {
    return `${baseUrl}/pay/${invoiceId}`;
  }

  return `${baseUrl}/api/payment/checkout/${invoiceId}`;
}
