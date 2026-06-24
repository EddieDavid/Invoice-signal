import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.invoice.update({
    where: { id },
    data: { status: "paid" },
  });

  return NextResponse.json({ ok: true });
}
