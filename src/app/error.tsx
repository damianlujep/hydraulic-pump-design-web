"use client";

import { WorkspaceErrorCard } from "@/components/workspace/layout/WorkspaceErrorCard";

const ErrorPage = ({ reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  return (
    <div className="h-screen">
      <WorkspaceErrorCard
        title="Algo salió mal"
        message="Ocurrió un error inesperado. Puedes reintentar o volver al explorador."
        onRetry={reset}
      />
    </div>
  );
};

export default ErrorPage;
