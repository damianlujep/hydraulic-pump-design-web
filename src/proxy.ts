import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE, parseSetCookieValue, REFRESH_TOKEN_COOKIE } from "@/lib/api/cookies";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

const PUBLIC_PATHS = ["/login"];

type RefreshResult = { ok: boolean; accessToken?: string; setCookies: string[] };

// Single-flight per refresh token: concurrent RSC/prefetch requests after idle must not each hit
// the refresh endpoint, or token rotation kills the session.
const inflightRefresh = new Map<string, Promise<RefreshResult>>();

const refreshSession = async (request: NextRequest): Promise<RefreshResult> => {
  try {
    const res = await fetch(new URL("/api/auth/refresh", request.url), {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    if (!res.ok) return { ok: false, setCookies: [] };
    const setCookies = res.headers.getSetCookie();
    const accessToken = parseSetCookieValue(setCookies, ACCESS_TOKEN_COOKIE);
    if (!accessToken) return { ok: false, setCookies: [] };
    return { ok: true, accessToken, setCookies };
  } catch {
    return { ok: false, setCookies: [] };
  }
};

const refreshOnce = (refreshToken: string, request: NextRequest): Promise<RefreshResult> => {
  let promise = inflightRefresh.get(refreshToken);
  if (!promise) {
    promise = refreshSession(request).then((result) => {
      if (result.ok) {
        // Keep briefly: late requests still carrying the old (rotated-out) refresh token reuse
        // this result instead of failing at the backend.
        setTimeout(() => inflightRefresh.delete(refreshToken), 30_000);
      } else {
        inflightRefresh.delete(refreshToken);
      }
      return result;
    });
    inflightRefresh.set(refreshToken, promise);
  }
  return promise;
};

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (accessToken) {
      const target = safeRedirectPath(request.nextUrl.searchParams.get("redirect"));
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);

    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) return NextResponse.redirect(loginUrl);

    const result = await refreshOnce(refreshToken, request);
    if (!result.ok || !result.accessToken) return NextResponse.redirect(loginUrl);

    // Forward the fresh token on the request that continues inward, so server components and
    // route guards see it — the Set-Cookie below only reaches the browser, not this render pass.
    const requestHeaders = new Headers(request.headers);
    const cookieHeader = requestHeaders.get("cookie");
    const accessCookie = `${ACCESS_TOKEN_COOKIE}=${result.accessToken}`;
    requestHeaders.set("cookie", cookieHeader ? `${cookieHeader}; ${accessCookie}` : accessCookie);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    result.setCookies.forEach((c) => response.headers.append("set-cookie", c));
    return response;
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
