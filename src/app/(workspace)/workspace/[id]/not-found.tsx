import { WorkspaceErrorCard } from "@/components/workspace/layout/WorkspaceErrorCard";

const WorkspaceNotFound = () => {
  return (
    <WorkspaceErrorCard
      title="Proyecto no encontrado"
      message="El proyecto que buscas no existe o fue eliminado."
    />
  );
};

export default WorkspaceNotFound;
