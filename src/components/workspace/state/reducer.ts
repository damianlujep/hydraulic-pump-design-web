import type { CalcStatus, PipeKind, PipeSection, SaveStatus, SizeModalState, SurveyRow, TabId, TestPointDraft } from "@/interfaces/workspace";
import type { DesignDataDto, NewProjectInfoDto } from "@/lib/api/projects";
import type { IprCalculationResponse } from "@/lib/api/calculations";

export type WorkspaceState = {
  activeTab: TabId;
  calcStatus: CalcStatus;
  survey: SurveyRow[];
  casing: PipeSection[];
  tubing: PipeSection[];
  iprResult: IprCalculationResponse | null;
  iprFingerprint: string | null;
  iprCalcModalOpen: boolean;
  // Session-ephemeral calc inputs (no IprDto field exists for these yet) — kept in reducer state
  // so closing/reopening the calc modal within a session doesn't lose points 2..n or the design
  // rate. Never registered as DATA_ACTIONS (see below).
  iprExtraTestPoints: TestPointDraft[];
  iprDesiredOilRate: string;
  newProjectInfo: DesignDataDto["newProjectInfo"];
  version: number;
  revision: number;
  saveStatus: SaveStatus;
  sizeModal: SizeModalState;
  surveyModalOpen: boolean;
};

export type WorkspaceAction =
  | { type: "SET_TAB"; tab: TabId }
  | { type: "CALC_RUNNING" }
  | { type: "CALC_SUCCESS"; result: IprCalculationResponse; fingerprint: string }
  | { type: "CALC_ERROR" }
  | { type: "CALC_IDLE" }
  | { type: "OPEN_SURVEY_MODAL" }
  | { type: "CLOSE_SURVEY_MODAL" }
  | { type: "SAVE_SURVEY"; rows: SurveyRow[] }
  | { type: "ADD_SECTION"; kind: PipeKind }
  | { type: "REMOVE_SECTION"; kind: PipeKind; index: number }
  | { type: "SET_SECTION_LENGTH"; kind: PipeKind; index: number; length: string }
  | { type: "OPEN_SIZE_MODAL"; kind: PipeKind; target: number }
  | { type: "CLOSE_SIZE_MODAL" }
  | { type: "SET_SIZE_SEARCH"; search: string }
  | { type: "PICK_SIZE"; catalogId: number }
  | { type: "MARK_DIRTY" }
  | { type: "SAVE_STARTED" }
  | { type: "SAVE_SUCCESS"; version: number; revision: number }
  | { type: "SAVE_ERROR" }
  | { type: "SAVE_CONFLICT" }
  | { type: "DISMISS_CONFLICT" }
  | { type: "METADATA_SAVED"; version: number }
  | { type: "SET_PROJECT_INFO"; data: NewProjectInfoDto }
  | { type: "OPEN_IPR_CALC_MODAL" }
  | { type: "CLOSE_IPR_CALC_MODAL" }
  | { type: "SET_IPR_CALC_PARAMS"; extraTestPoints: TestPointDraft[]; desiredOilRate: string }
  | { type: "SAVE_NOOP"; revision: number };

// Actions that mutate persistable document data — they bump `revision` and mark the project dirty
// so the autosave effect (keyed on `revision`) picks them up. Field edits inside the RHF-controlled
// forms reach the reducer only through the synthetic MARK_DIRTY action.
const DATA_ACTIONS = new Set<WorkspaceAction["type"]>([
  "SAVE_SURVEY",
  "PICK_SIZE",
  "ADD_SECTION",
  "REMOVE_SECTION",
  "SET_SECTION_LENGTH",
  "MARK_DIRTY",
  "CALC_SUCCESS",
  "SET_PROJECT_INFO",
]);

export const createInitialState = (input: {
  project: { version?: number; designData?: DesignDataDto };
  casing: PipeSection[];
  tubing: PipeSection[];
  survey: SurveyRow[];
  iprResult: IprCalculationResponse | null;
  iprFingerprint: string | null;
}): WorkspaceState => ({
  activeTab: "completion",
  calcStatus: "idle",
  survey: input.survey,
  casing: input.casing,
  tubing: input.tubing,
  iprResult: input.iprResult,
  iprFingerprint: input.iprFingerprint,
  iprCalcModalOpen: false,
  iprExtraTestPoints: [],
  iprDesiredOilRate: "",
  newProjectInfo: input.project.designData?.newProjectInfo,
  version: input.project.version ?? 0,
  revision: 0,
  saveStatus: "idle",
  sizeModal: { open: false, kind: "casing", target: 0, search: "" },
  surveyModalOpen: false,
});

const applyAction = (state: WorkspaceState, action: WorkspaceAction): WorkspaceState => {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.tab };
    case "CALC_RUNNING":
      return { ...state, calcStatus: "running" };
    case "CALC_SUCCESS":
      return { ...state, calcStatus: "done", iprResult: action.result, iprFingerprint: action.fingerprint };
    case "CALC_ERROR":
      return { ...state, calcStatus: "error" };
    case "CALC_IDLE":
      return { ...state, calcStatus: "idle" };
    case "OPEN_SURVEY_MODAL":
      return { ...state, surveyModalOpen: true };
    case "CLOSE_SURVEY_MODAL":
      return { ...state, surveyModalOpen: false };
    case "SAVE_SURVEY":
      return { ...state, surveyModalOpen: false, survey: action.rows };
    case "ADD_SECTION": {
      const arr = state[action.kind];
      if (arr.length >= 3) return state;
      return { ...state, [action.kind]: [...arr, { catalogId: null, length: "" }] };
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
      arr[m.target] = { ...arr[m.target], catalogId: action.catalogId };
      return { ...state, [m.kind]: arr, sizeModal: { ...m, open: false } };
    }
    case "MARK_DIRTY":
      return state;
    case "SAVE_STARTED":
      return { ...state, saveStatus: "saving" };
    case "SAVE_SUCCESS":
      return { ...state, version: action.version, saveStatus: action.revision === state.revision ? "saved" : "dirty" };
    case "SAVE_ERROR":
      return { ...state, saveStatus: "error" };
    case "SAVE_CONFLICT":
      return { ...state, saveStatus: "conflict" };
    case "DISMISS_CONFLICT":
      return { ...state, saveStatus: "dirty" };
    case "METADATA_SAVED":
      return { ...state, version: action.version };
    case "SET_PROJECT_INFO":
      return { ...state, newProjectInfo: { dataEntered: true, data: action.data } };
    case "OPEN_IPR_CALC_MODAL":
      return { ...state, iprCalcModalOpen: true };
    case "CLOSE_IPR_CALC_MODAL":
      return { ...state, iprCalcModalOpen: false };
    case "SET_IPR_CALC_PARAMS":
      return { ...state, iprExtraTestPoints: action.extraTestPoints, iprDesiredOilRate: action.desiredOilRate };
    case "SAVE_NOOP":
      return { ...state, saveStatus: action.revision === state.revision ? "saved" : "dirty" };
    default:
      return state;
  }
};

export const workspaceReducer = (state: WorkspaceState, action: WorkspaceAction): WorkspaceState => {
  const next = applyAction(state, action);
  if (!DATA_ACTIONS.has(action.type)) return next;
  return { ...next, revision: state.revision + 1, saveStatus: "dirty" };
};
