import { NextResponse } from "next/server";
import { clearAccessCookie, parseRefreshToken, readRequestCookie, setAuthCookies } from "@/lib/api/auth-cookies";
import { REFRESH_TOKEN_COOKIE } from "@/lib/api/cookies";
import type { components } from "@/lib/api/schema";

type RefreshOutcome =
  | { ok: true; user: components["schemas"]["UserResponse"] | undefined; accessToken: string; refreshToken: string }
  | { ok: false; expired: boolean };

// Single-flight per refresh token: the backend rotates refresh tokens, so concurrent callers
// (middleware + browser) sharing one token must share one backend call — the loser of the race
// would otherwise get 401 and log out.
const inflight = new Map<string, Promise<RefreshOutcome>>();

const callBackend = async (refreshToken: string): Promise<RefreshOutcome> => {
  try {
    const backendRes = await fetch(`${process.env.API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
    });

    if (!backendRes.ok) {
      return { ok: false, expired: backendRes.status === 401 || backendRes.status === 403 };
    }

    const { accessToken, user }: components["schemas"]["AuthResponse"] = await backendRes.json();
    const rotatedRefreshToken = parseRefreshToken(backendRes.headers.getSetCookie());

    if (!accessToken || !rotatedRefreshToken) return { ok: false, expired: false };
    return { ok: true, user, accessToken, refreshToken: rotatedRefreshToken };
  } catch {
    return { ok: false, expired: false };
  }
};

const refreshOnce = (refreshToken: string): Promise<RefreshOutcome> => {
  let promise = inflight.get(refreshToken);
  if (!promise) {
    promise = callBackend(refreshToken).then((result) => {
      if (result.ok) {
        // Keep briefly: stragglers still presenting the rotated-out token reuse this result
        // instead of failing at the backend.
        setTimeout(() => inflight.delete(refreshToken), 30_000);
      } else {
        inflight.delete(refreshToken);
      }
      return result;
    });
    inflight.set(refreshToken, promise);
  }
  return promise;
};

export const POST = async (request: Request) => {
  const refreshToken = readRequestCookie(request, REFRESH_TOKEN_COOKIE);

  if (!refreshToken) {
    const res = NextResponse.json({ message: "No refresh token" }, { status: 401 });
    clearAccessCookie(res);
    return res;
  }

  const result = await refreshOnce(refreshToken);

  if (!result.ok) {
    const res = NextResponse.json(
      { message: "Session expired" },
      { status: result.expired ? 401 : 502 },
    );
    if (result.expired) clearAccessCookie(res);
    return res;
  }

  const res = NextResponse.json({ user: result.user });
  setAuthCookies(res, result.accessToken, result.refreshToken);
  return res;
};
