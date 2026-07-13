import { createServerClient, forwardOpenApiResponse } from "@/lib/api/server-client";

export const GET = async () => {
  const client = await createServerClient();
  const result = await client.GET("/api/v1/projects/stats");
  return forwardOpenApiResponse(result);
};
