import { NextRequest, NextResponse } from "next/server";
import { createServerClient, forwardOpenApiResponse } from "@/lib/api/server-client";
import type { components } from "@/lib/api/schema";

export const GET = async (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 0);
  const size = Number(searchParams.get("size") ?? 20);
  const q = searchParams.get("q") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const scope = searchParams.get("scope") ?? undefined;

  const client = await createServerClient();
  const result = await client.GET("/api/v1/projects", {
    params: { query: { page, size, q, sort, scope } },
  });
  return forwardOpenApiResponse(result);
};

export const POST = async (req: NextRequest) => {
  const [body, client] = await Promise.all([
    req.json() as Promise<components["schemas"]["CreateProjectRequest"]>,
    createServerClient(),
  ]);

  const result = await client.POST("/api/v1/projects", { body });
  return forwardOpenApiResponse(result, (data) => NextResponse.json(data, { status: 201 }));
};
