"use client";

import { createContext, useContext, useReducer, useRef } from "react";
import { createInitialState, workspaceReducer, type WorkspaceAction, type WorkspaceState } from "./reducer";

type WorkspaceContextValue = {
  state: WorkspaceState;
  dispatch: React.Dispatch<WorkspaceAction>;
  runCalc: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ isNew, children }: { isNew: boolean; children: React.ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, isNew, createInitialState);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const runCalc = () => {
    if (state.calcStatus === "running") return;
    dispatch({ type: "CALC_RUNNING" });
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => dispatch({ type: "CALC_DONE" }), 1300),
      setTimeout(() => dispatch({ type: "CALC_IDLE" }), 4400),
    ];
  };

  return (
    <WorkspaceContext.Provider value={{ state, dispatch, runCalc }}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
}
