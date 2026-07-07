import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/api/cookies";

export function proxy(req: NextRequest) {
  if (!req.cookies.get(REFRESH_TOKEN_COOKIE)) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
