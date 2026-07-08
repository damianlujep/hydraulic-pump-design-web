import "server-only";
import type { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  parseSetCookieValue,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "./cookies";

export const parseRefreshToken = (setCookies: string[]): string | null => {
  return parseSetCookieValue(setCookies, REFRESH_TOKEN_COOKIE);
};

export const readRequestCookie = (request: Request, name: string): string | undefined => {
  return request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);
};

export const setAuthCookies = (res: NextResponse, accessToken: string, refreshToken: string) => {
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
};

export const clearAuthCookies = (res: NextResponse) => {
  res.cookies.delete({ name: ACCESS_TOKEN_COOKIE, path: "/" });
  res.cookies.delete({ name: REFRESH_TOKEN_COOKIE, path: "/" });
};

export const clearAccessCookie = (res: NextResponse) => {
  res.cookies.delete({ name: ACCESS_TOKEN_COOKIE, path: "/" });
};
