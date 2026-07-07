import { NextResponse } from "next/server";
import { clearAuthCookies, parseRefreshToken, readRequestCookie, setAuthCookies } from "@/lib/api/auth-cookies";
import { REFRESH_TOKEN_COOKIE } from "@/lib/api/cookies";
import type { components } from "@/lib/api/schema";

export async function POST(request: Request) {
  const refreshToken = readRequestCookie(request, REFRESH_TOKEN_COOKIE);

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  const backendRes = await fetch(`${process.env.API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
  });

  if (!backendRes.ok) {
    const res = NextResponse.json(await backendRes.json().catch(() => null), {
      status: backendRes.status,
    });
    if (backendRes.status === 401) clearAuthCookies(res);
    return res;
  }

  const { accessToken, user }: components["schemas"]["AuthResponse"] = await backendRes.json();
  const rotatedRefreshToken = parseRefreshToken(backendRes.headers.getSetCookie());

  if (!accessToken || !rotatedRefreshToken) {
    return NextResponse.json({ message: "Malformed auth response" }, { status: 502 });
  }

  const res = NextResponse.json({ user });
  setAuthCookies(res, accessToken, rotatedRefreshToken);
  return res;
}
