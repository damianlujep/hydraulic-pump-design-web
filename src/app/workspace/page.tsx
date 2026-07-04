import { Suspense } from "react";
import { WorkspaceScreen } from "@/components/workspace/WorkspaceScreen";

export default function WorkspacePage() {
  return (
    <Suspense>
      <WorkspaceScreen />
    </Suspense>
  );
}
