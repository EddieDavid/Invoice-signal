import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "invoice-signal-secret-local"
);

const PUBLIC_PATHS = ["/", "/connexion", "/inscription", "/login", "/pay", "/api/auth", "/mot-de-passe-oublie", "/reinitialiser-mot-de-passe", "/mentions-legales", "/politique-de-confidentialite", "/cgu"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/payment")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
