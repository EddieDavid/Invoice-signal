import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import Papa from "papaparse";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { companyId } = session;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });

  const text = await file.text();
  const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true, delimiter: "," });
  const rows = parsed.data;
  let imported = 0;
  const errors: string[] = [];

  const dataRows = rows[0]?.[0]?.toLowerCase().includes("nom") ? rows.slice(1) : rows;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const lineNum = i + (rows === dataRows ? 1 : 2);

    if (row.length < 5) {
      errors.push(`Ligne ${lineNum} : colonnes insuffisantes (${row.length}/5)`);
      continue;
    }

    const [clientName, clientEmail, invoiceNumber, amountStr, dueDateStr] = row.map((s) => s.trim());

    if (!clientName || !clientEmail || !invoiceNumber) {
      errors.push(`Ligne ${lineNum} : données manquantes`);
      continue;
    }

    const amount = parseFloat(amountStr.replace(",", ".").replace(/\s/g, ""));
    if (isNaN(amount)) {
      errors.push(`Ligne ${lineNum} : montant invalide "${amountStr}"`);
      continue;
    }

    const parts = dueDateStr.split("/");
    const dueDate = parts.length === 3
      ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      : new Date(dueDateStr);

    if (isNaN(dueDate.getTime())) {
      errors.push(`Ligne ${lineNum} : date invalide "${dueDateStr}"`);
      continue;
    }

    await prisma.invoice.create({
      data: { companyId, clientName, clientEmail, invoiceNumber, amount, dueDate, status: "pending" },
    });
    imported++;
  }

  await trackEvent(companyId, "csv_imported", { imported, errors_count: errors.length });
  return NextResponse.json({ imported, errors });
}
