import { Suspense } from "react";
import { WorkspaceScreen } from "@/components/workspace/WorkspaceScreen";

const WorkspacePage = () => {
  return (
    <Suspense>
      <WorkspaceScreen />
    </Suspense>
  );
};

export default WorkspacePage;
