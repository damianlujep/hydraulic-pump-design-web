import "server-only";
import { cookies } from "next/headers";
import createClient from "openapi-fetch";
import { NextResponse } from "next/server";
import type { paths } from "./schema";
import { ACCESS_TOKEN_COOKIE } from "./cookies";

export async function createServerClient() {
  const jar = await cookies();
  const token = jar.get(ACCESS_TOKEN_COOKIE)?.value;

  return createClient<paths>({
    baseUrl: process.env.API_URL ?? "http://localhost:8080",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// The generated spec documents no 4xx/5xx responses, so openapi-fetch's `error` type collapses
// to `never` on every operation — branch on `response.ok` instead of `error`, which stays a plain
// `Response` regardless. `error` is still the real backend error body at runtime.
function forwardOpenApiError(result: { error?: unknown; response: Response }): NextResponse {
  return NextResponse.json(result.error ?? null, { status: result.response.status });
}

// For operations whose success response has a body.
export function forwardOpenApiResponse<T>(
  result: { data?: T; error?: unknown; response: Response },
  onSuccess: (data: T) => NextResponse = (data) => NextResponse.json(data),
): NextResponse {
  if (!result.response.ok) return forwardOpenApiError(result);
  if (result.data === undefined) return NextResponse.json(null, { status: 502 });
  return onSuccess(result.data);
}

// For operations whose success response has no body (`content?: never` in the generated schema,
// e.g. delete/lock-release) — `data` is always `undefined` on success too, so it can't gate here.
export function forwardOpenApiVoidResponse(
  result: { error?: unknown; response: Response },
  successStatus = 204,
): NextResponse {
  if (!result.response.ok) return forwardOpenApiError(result);
  return new NextResponse(null, { status: successStatus });
}
