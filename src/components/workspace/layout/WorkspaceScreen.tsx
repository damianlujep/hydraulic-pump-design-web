"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WorkspaceProvider, useWorkspace } from "../state/WorkspaceContext";
import { WorkspaceNavbar } from "./WorkspaceNavbar";
import { ProgressTabs } from "./ProgressTabs";
import { WorkspaceLeftPanel } from "./WorkspaceLeftPanel";
import { WorkspaceRightCanvas } from "./WorkspaceRightCanvas";
import { SurveyModal } from "../modals/SurveyModal";
import { SizePickerModal } from "../modals/SizePickerModal";
import { ConflictDialog } from "../modals/ConflictDialog";
import { ReadOnlyBanner } from "./ReadOnlyBanner";
import { WorkspaceErrorCard } from "./WorkspaceErrorCard";
import { WorkspaceSkeleton } from "./WorkspaceSkeleton";
import { useProject, type ProjectResponse } from "@/lib/api/projects";
import { useCasings, type TubularItem } from "@/lib/api/casings";
import { useTubings } from "@/lib/api/tubings";
import { queryKeys } from "@/lib/api/query-keys";

const WorkspaceBody = () => {
  const { state, lock, retryLock, dismissConflict, requestReload } = useWorkspace();

  return (
    <>
      <div className="flex flex-col h-full animate-fade">
        <WorkspaceNavbar />
        <ReadOnlyBanner lock={lock} onRetry={retryLock} />
        <ProgressTabs />
        <div className="flex-1 flex min-h-0">
          <section className="w-[45%] flex-none overflow-y-auto p-[18px_20px_24px] flex flex-col gap-[14px] border-r border-border">
            <WorkspaceLeftPanel />
          </section>
          <section className="flex-1 min-w-0 overflow-y-auto p-[18px_20px_24px] flex flex-col gap-4 bg-surface-2">
            <WorkspaceRightCanvas />
          </section>
        </div>
      </div>
      <SurveyModal />
      <SizePickerModal />
      {state.saveStatus === "conflict" && <ConflictDialog onReload={requestReload} onKeepEditing={dismissConflict} />}
    </>
  );
};

type WorkspaceScreenProps = {
  projectId: number;
  initialProject: ProjectResponse;
  initialCasings: TubularItem[];
  initialTubings: TubularItem[];
};

export const WorkspaceScreen = ({ projectId, initialProject, initialCasings, initialTubings }: WorkspaceScreenProps) => {
  const qc = useQueryClient();
  const [reloadToken, setReloadToken] = useState(0);

  const project = useProject(projectId, { initialData: initialProject });
  const casings = useCasings({ initialData: initialCasings });
  const tubings = useTubings({ initialData: initialTubings });

  if (project.isPending || casings.isPending || tubings.isPending) {
    return <WorkspaceSkeleton />;
  }

  if (project.isError || casings.isError || tubings.isError) {
    return (
      <WorkspaceErrorCard
        title="No se pudo cargar el proyecto"
        message="Ocurrió un error al comunicarse con el servidor."
        onRetry={() => {
          void project.refetch();
          void casings.refetch();
          void tubings.refetch();
        }}
      />
    );
  }

  const requestReload = () => {
    void qc.refetchQueries({ queryKey: queryKeys.projects.detail(projectId) }).then(() => {
      setReloadToken((t) => t + 1);
    });
  };

  return (
    <WorkspaceProvider
      key={`${projectId}:${reloadToken}`}
      project={project.data}
      casings={casings.data}
      tubings={tubings.data}
      onReloadRequested={requestReload}
    >
      <WorkspaceBody />
    </WorkspaceProvider>
  );
};
