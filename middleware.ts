import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("auth_user");

  const isLoginPage = request.nextUrl.pathname === "/login";

  // si NO está logueado → mandar al login
  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // si está logueado y entra a /login → mandar a registros
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL("/registros", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
