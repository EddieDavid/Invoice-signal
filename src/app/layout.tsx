import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import PosthogProvider from "@/components/PosthogProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvoiceSignal — Relance de factures",
  description: "Outil de relance automatique pour factures impayées",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.className}>
      <body>
        <PosthogProvider>{children}</PosthogProvider>
      </body>
    </html>
  );
}
