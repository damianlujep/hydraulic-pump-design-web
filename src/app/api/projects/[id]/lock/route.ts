import { createServerClient, forwardOpenApiResponse, forwardOpenApiVoidResponse } from "@/lib/api/server-client";

export const POST = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const [{ id }, client] = await Promise.all([params, createServerClient()]);

  const result = await client.POST("/api/v1/projects/{id}/lock", {
    params: { path: { id: Number(id) } },
  });
  return forwardOpenApiResponse(result);
};

export const PUT = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const [{ id }, client] = await Promise.all([params, createServerClient()]);

  const result = await client.PUT("/api/v1/projects/{id}/lock", {
    params: { path: { id: Number(id) } },
  });
  return forwardOpenApiResponse(result);
};

export const DELETE = async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const [{ id }, client] = await Promise.all([params, createServerClient()]);

  const result = await client.DELETE("/api/v1/projects/{id}/lock", {
    params: { path: { id: Number(id) } },
  });
  return forwardOpenApiVoidResponse(result);
};
