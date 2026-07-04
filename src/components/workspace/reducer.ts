import { DEFAULT_CASING, DEFAULT_TUBING } from "@/lib/data";
import type { CalcStatus, PipeKind, PipeSection, SizeModalState, TabId } from "@/lib/types";

export type WorkspaceState = {
  activeTab: TabId;
  calcStatus: CalcStatus;
  surveyLoaded: boolean;
  iprReady: boolean;
  pvtReady: boolean;
  casing: PipeSection[];
  tubing: PipeSection[];
  sizeModal: SizeModalState;
  surveyModalOpen: boolean;
};

export type WorkspaceAction =
  | { type: "SET_TAB"; tab: TabId }
  | { type: "CALC_RUNNING" }
  | { type: "CALC_DONE" }
  | { type: "CALC_IDLE" }
  | { type: "OPEN_SURVEY_MODAL" }
  | { type: "CLOSE_SURVEY_MODAL" }
  | { type: "SAVE_SURVEY" }
  | { type: "SET_PVT_READY" }
  | { type: "ADD_SECTION"; kind: PipeKind }
  | { type: "REMOVE_SECTION"; kind: PipeKind; index: number }
  | { type: "SET_SECTION_LENGTH"; kind: PipeKind; index: number; length: string }
  | { type: "OPEN_SIZE_MODAL"; kind: PipeKind; target: number }
  | { type: "CLOSE_SIZE_MODAL" }
  | { type: "SET_SIZE_SEARCH"; search: string }
  | { type: "PICK_SIZE"; idx: number };

export function createInitialState(isNew: boolean): WorkspaceState {
  const filled = !isNew;
  return {
    activeTab: "ipr",
    calcStatus: "idle",
    surveyLoaded: filled,
    iprReady: filled,
    pvtReady: filled,
    casing: DEFAULT_CASING.map((s) => ({ ...s })),
    tubing: DEFAULT_TUBING.map((s) => ({ ...s })),
    sizeModal: { open: false, kind: "casing", target: 0, search: "" },
    surveyModalOpen: false,
  };
}

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.tab };
    case "CALC_RUNNING":
      return { ...state, calcStatus: "running" };
    case "CALC_DONE":
      return { ...state, calcStatus: "done", iprReady: true };
    case "CALC_IDLE":
      return { ...state, calcStatus: "idle" };
    case "OPEN_SURVEY_MODAL":
      return { ...state, surveyModalOpen: true };
    case "CLOSE_SURVEY_MODAL":
      return { ...state, surveyModalOpen: false };
    case "SAVE_SURVEY":
      return { ...state, surveyModalOpen: false, surveyLoaded: true };
    case "SET_PVT_READY":
      return { ...state, pvtReady: true };
    case "ADD_SECTION": {
      const arr = state[action.kind];
      if (arr.length >= 3) return state;
      return { ...state, [action.kind]: [...arr, { sizeIdx: 0, length: "" }] };
    }
    case "REMOVE_SECTION": {
      const arr = state[action.kind];
      return { ...state, [action.kind]: arr.filter((_, i) => i !== action.index) };
    }
    case "SET_SECTION_LENGTH": {
      const arr = state[action.kind].slice();
      arr[action.index] = { ...arr[action.index], length: action.length };
      return { ...state, [action.kind]: arr };
    }
    case "OPEN_SIZE_MODAL":
      return { ...state, sizeModal: { open: true, kind: action.kind, target: action.target, search: "" } };
    case "CLOSE_SIZE_MODAL":
      return { ...state, sizeModal: { ...state.sizeModal, open: false } };
    case "SET_SIZE_SEARCH":
      return { ...state, sizeModal: { ...state.sizeModal, search: action.search } };
    case "PICK_SIZE": {
      const m = state.sizeModal;
      const arr = state[m.kind].slice();
      arr[m.target] = { ...arr[m.target], sizeIdx: action.idx };
      return { ...state, [m.kind]: arr, sizeModal: { ...m, open: false } };
    }
    default:
      return state;
  }
}
