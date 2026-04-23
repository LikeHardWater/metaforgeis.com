import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";

// Lightweight auth for Edge Runtime — JWT only, no DB adapter
const { auth } = NextAuth({
  providers: [MicrosoftEntraID, Credentials],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/api/contact",
  "/api/quote",
  "/quote",
  "/_next",
  "/favicon.ico",
  "/images",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const isProtected =
    pathname.startsWith("/app") || pathname.startsWith("/admin");

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
