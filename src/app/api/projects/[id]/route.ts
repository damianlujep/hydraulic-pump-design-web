import { createServerClient, forwardOpenApiVoidResponse } from "@/lib/api/server-client";

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const [{ id }, client] = await Promise.all([params, createServerClient()]);

  const result = await client.DELETE("/api/v1/projects/{id}", {
    params: { path: { id: Number(id) } },
  });
  return forwardOpenApiVoidResponse(result);
};
