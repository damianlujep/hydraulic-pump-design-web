import { createServerClient, forwardOpenApiResponse } from "@/lib/api/server-client";

export async function GET() {
  const client = await createServerClient();
  const result = await client.GET("/api/v1/auth/me");
  return forwardOpenApiResponse(result);
}
