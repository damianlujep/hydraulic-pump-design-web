import { createServerClient, forwardOpenApiResponse } from "@/lib/api/server-client";
import type { components } from "@/lib/api/schema";

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const [{ id }, client] = await Promise.all([params, createServerClient()]);

  const result = await client.GET("/api/v1/projects/{id}/members", {
    params: { path: { id: Number(id) } },
  });
  return forwardOpenApiResponse(result);
};

export const POST = async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const [{ id }, body, client] = await Promise.all([
    params,
    req.json() as Promise<components["schemas"]["AddProjectMemberRequest"]>,
    createServerClient(),
  ]);

  const result = await client.POST("/api/v1/projects/{id}/members", {
    params: { path: { id: Number(id) } },
    body,
  });
  return forwardOpenApiResponse(result);
};
