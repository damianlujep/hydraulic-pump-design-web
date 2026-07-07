import { NextResponse } from "next/server";
import { parseRefreshToken, setAuthCookies } from "@/lib/api/auth-cookies";
import type { components } from "@/lib/api/schema";

export async function POST(request: Request) {
  const body: components["schemas"]["LoginRequest"] = await request.json();

  const backendRes = await fetch(`${process.env.API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!backendRes.ok) {
    return NextResponse.json(await backendRes.json(), { status: backendRes.status });
  }

  const { accessToken, user }: components["schemas"]["AuthResponse"] = await backendRes.json();
  const refreshToken = parseRefreshToken(backendRes.headers.getSetCookie());

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ message: "Malformed auth response" }, { status: 502 });
  }

  const res = NextResponse.json({ user });
  setAuthCookies(res, accessToken, refreshToken);
  return res;
}
