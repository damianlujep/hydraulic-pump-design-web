"use client";

import { IprForm } from "../panels/IprForm";
import { FluidsForm } from "../panels/FluidsForm";
import { CompletionForm } from "../panels/CompletionForm";
import { useWorkspace } from "../state/WorkspaceContext";

export const WorkspaceLeftPanel = () => {
  const { state, canEdit } = useWorkspace();

  return (
    <fieldset disabled={!canEdit} className="contents min-w-0">
      {state.activeTab === "ipr" && <IprForm />}
      {state.activeTab === "completion" && <CompletionForm />}
      {state.activeTab === "fluids" && <FluidsForm />}
      {state.activeTab === "calc" && (
        <div className="text-[13px] text-text-dim p-4 text-center">
          El módulo de cálculos está en desarrollo.
        </div>
      )}
    </fieldset>
  );
};
