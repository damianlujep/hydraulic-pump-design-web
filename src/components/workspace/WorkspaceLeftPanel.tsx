"use client";

import { IprForm } from "./panels/IprForm";
import { FluidsForm } from "./panels/FluidsForm";
import { CompletionForm } from "./panels/CompletionForm";
import { useWorkspace } from "./WorkspaceContext";

export function WorkspaceLeftPanel() {
  const { state } = useWorkspace();

  if (state.activeTab === "ipr") return <IprForm />;
  if (state.activeTab === "completion") return <CompletionForm />;
  if (state.activeTab === "fluids") return <FluidsForm />;
  return null;
}
