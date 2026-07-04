"use client";

import { useSearchParams } from "next/navigation";
import { WorkspaceProvider } from "./WorkspaceContext";
import { WorkspaceNavbar } from "./WorkspaceNavbar";
import { ProgressTabs } from "./ProgressTabs";
import { WorkspaceLeftPanel } from "./WorkspaceLeftPanel";
import { WorkspaceRightCanvas } from "./WorkspaceRightCanvas";
import { SurveyModal } from "./SurveyModal";
import { SizePickerModal } from "./SizePickerModal";

export function WorkspaceScreen() {
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";

  return (
    <WorkspaceProvider isNew={isNew}>
      <div className="flex flex-col h-full animate-fade">
        <WorkspaceNavbar />
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
    </WorkspaceProvider>
  );
}
