import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "invoice-signal-secret-local"
);

export async function createSession(companyId: string) {
  const token = await new SignJWT({ companyId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  return token;
}

export async function getSession(): Promise<{ companyId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.companyId !== "string") return null;
    return { companyId: payload.companyId };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<{ companyId: string }> {
  const session = await getSession();
  if (!session) redirect("/connexion");
  return session;
}

export async function getCurrentCompany() {
  const session = await getSession();
  if (!session) return null;
  return prisma.company.findUnique({ where: { id: session.companyId } });
}

export async function registerCompany(name: string, email: string, password: string) {
  const existing = await prisma.company.findUnique({ where: { email } });
  if (existing) throw new Error("Un compte existe déjà avec cet email.");

  const passwordHash = await bcrypt.hash(password, 10);
  const company = await prisma.company.create({
    data: { name, email, passwordHash },
  });
  return company;
}

export async function loginCompany(email: string, password: string) {
  const company = await prisma.company.findUnique({ where: { email } });
  if (!company) throw new Error("Email ou mot de passe incorrect.");

  const valid = await bcrypt.compare(password, company.passwordHash);
  if (!valid) throw new Error("Email ou mot de passe incorrect.");

  return company;
}
