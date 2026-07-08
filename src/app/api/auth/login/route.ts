import { NextResponse } from "next/server";
import { parseRefreshToken, setAuthCookies } from "@/lib/api/auth-cookies";
import type { components } from "@/lib/api/schema";

export const POST = async (request: Request) => {
  const body: components["schemas"]["LoginRequest"] = await request.json();

  let backendRes: Response;
  try {
    backendRes = await fetch(`${process.env.API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ message: "Backend unreachable" }, { status: 502 });
  }

  if (!backendRes.ok) {
    const res = NextResponse.json(await backendRes.json().catch(() => null), { status: backendRes.status });
    const retryAfter = backendRes.headers.get("Retry-After");
    if (retryAfter) res.headers.set("Retry-After", retryAfter);
    return res;
  }

  const { accessToken, user }: components["schemas"]["AuthResponse"] = await backendRes.json();
  const refreshToken = parseRefreshToken(backendRes.headers.getSetCookie());

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ message: "Malformed auth response" }, { status: 502 });
  }

  const res = NextResponse.json({ user });
  setAuthCookies(res, accessToken, refreshToken);
  return res;
};
