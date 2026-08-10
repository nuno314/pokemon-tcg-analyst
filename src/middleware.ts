import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/decks/:path*", "/matches/:path*", "/onboarding"],
};
