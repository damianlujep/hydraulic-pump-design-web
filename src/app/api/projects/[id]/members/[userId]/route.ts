import { createServerClient, forwardOpenApiVoidResponse } from "@/lib/api/server-client";

export const DELETE = async (
  _req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) => {
  const [{ id, userId }, client] = await Promise.all([params, createServerClient()]);

  const result = await client.DELETE("/api/v1/projects/{id}/members/{userId}", {
    params: { path: { id: Number(id), userId: Number(userId) } },
  });
  return forwardOpenApiVoidResponse(result);
};
