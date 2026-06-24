import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice || invoice.companyId !== session.companyId) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const updated = await prisma.invoice.update({ where: { id }, data: { status: body.status } });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice || invoice.companyId !== session.companyId) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
