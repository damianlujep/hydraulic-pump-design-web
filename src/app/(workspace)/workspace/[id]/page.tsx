import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/api/server-client";
import { WorkspaceScreen } from "@/components/workspace/layout/WorkspaceScreen";
import { WorkspaceErrorCard } from "@/components/workspace/layout/WorkspaceErrorCard";

type WorkspacePageProps = {
  params: Promise<{ id: string }>;
};

const WorkspacePage = async ({ params }: WorkspacePageProps) => {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId) || projectId <= 0) notFound();

  const client = await createServerClient();

  // notFound()/redirect() throw internally — they must stay outside this try/catch, or the
  // catch block below would swallow them and render a generic error instead of a real 404.
  let results;
  try {
    results = await Promise.all([
      client.GET("/api/v1/projects/{id}", { params: { path: { id: projectId } } }),
      client.GET("/api/v1/casings"),
      client.GET("/api/v1/tubings"),
    ]);
  } catch {
    return (
      <WorkspaceErrorCard
        title="No se pudo cargar el proyecto"
        message="El servidor no está disponible. Verifica tu conexión e inténtalo de nuevo."
      />
    );
  }

  const [projectResult, casingsResult, tubingsResult] = results;

  if (projectResult.response.status === 404) notFound();
  if (projectResult.response.status === 403) {
    return (
      <WorkspaceErrorCard
        title="Sin acceso a este proyecto"
        message="No tienes permiso para ver este proyecto. Solicita acceso al propietario."
      />
    );
  }
  if (!projectResult.response.ok || !projectResult.data || !casingsResult.response.ok || !tubingsResult.response.ok) {
    return (
      <WorkspaceErrorCard
        title="No se pudo cargar el proyecto"
        message="Ocurrió un error al comunicarse con el servidor."
      />
    );
  }

  return (
    <WorkspaceScreen
      projectId={projectId}
      initialProject={projectResult.data}
      initialCasings={casingsResult.data ?? []}
      initialTubings={tubingsResult.data ?? []}
    />
  );
};

export default WorkspacePage;
