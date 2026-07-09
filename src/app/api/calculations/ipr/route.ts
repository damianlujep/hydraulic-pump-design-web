import { createServerClient, forwardOpenApiResponse } from "@/lib/api/server-client";
import type { components } from "@/lib/api/schema";

export const POST = async (req: Request) => {
  const [body, client] = await Promise.all([
    req.json() as Promise<components["schemas"]["IprCalculationRequest"]>,
    createServerClient(),
  ]);

  const result = await client.POST("/api/v1/calculations/ipr", { body });
  return forwardOpenApiResponse(result);
};
