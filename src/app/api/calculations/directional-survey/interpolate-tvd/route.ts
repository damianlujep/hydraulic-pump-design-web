import { createServerClient, forwardOpenApiResponse } from "@/lib/api/server-client";
import type { components } from "@/lib/api/schema";

export const POST = async (req: Request) => {
  const [body, client] = await Promise.all([
    req.json() as Promise<components["schemas"]["TvdInterpolationRequest"]>,
    createServerClient(),
  ]);

  const result = await client.POST("/api/v1/calculations/directional-survey/interpolate-tvd", { body });
  return forwardOpenApiResponse(result);
};
