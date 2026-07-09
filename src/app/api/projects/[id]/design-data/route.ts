import { createServerClient, forwardOpenApiResponse } from "@/lib/api/server-client";
import type { components } from "@/lib/api/schema";

export const PUT = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const [{ id }, body, client] = await Promise.all([
    params,
    req.json() as Promise<components["schemas"]["UpdateDesignDataRequest"]>,
    createServerClient(),
  ]);

  const result = await client.PUT("/api/v1/projects/{id}/design-data", {
    params: { path: { id: Number(id) } },
    body,
  });
  return forwardOpenApiResponse(result);
};
