import { NextResponse } from "next/server";
import { clearAuthCookies, readRequestCookie } from "@/lib/api/auth-cookies";
import { REFRESH_TOKEN_COOKIE } from "@/lib/api/cookies";

export const POST = async (request: Request) => {
  const refreshToken = readRequestCookie(request, REFRESH_TOKEN_COOKIE);

  if (refreshToken) {
    try {
      await fetch(`${process.env.API_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: { Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
      });
    } catch {
      // backend unreachable — still clear local cookies below
    }
  }

  const res = new NextResponse(null, { status: 204 });
  clearAuthCookies(res);
  return res;
};
