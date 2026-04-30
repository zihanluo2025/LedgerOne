import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/products",
  "/suppliers",
  "/customers",
  "/employees",
  "/departments",
  "/logs",
  "/dashboard",
  "/approvals",
];

const AUTH_COOKIE_NAME =
  process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "legerone_auth_local";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) return NextResponse.next();

  const authed = req.cookies.get(AUTH_COOKIE_NAME)?.value === "1";

  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/products/:path*",
    "/suppliers/:path*",
    "/customers/:path*",
    "/employees/:path*",
    "/departments/:path*",
    "/logs/:path*",
    "/dashboard/:path*",
    "/approvals/:path*",
  ],
};