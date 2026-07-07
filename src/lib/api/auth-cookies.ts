import "server-only";
import type { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "./cookies";

export function parseRefreshToken(setCookies: string[]): string | null {
  for (const header of setCookies) {
    const match = header.match(/^refresh_token=([^;]*)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

export function readRequestCookie(request: Request, name: string): string | undefined {
  return request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function setAuthCookies(res: NextResponse, accessToken: string, refreshToken: string) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  res.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.delete({ name: ACCESS_TOKEN_COOKIE, path: "/" });
  res.cookies.delete({ name: REFRESH_TOKEN_COOKIE, path: "/" });
}
