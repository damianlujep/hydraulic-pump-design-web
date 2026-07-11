export type TabId = "completion" | "fluids" | "ipr" | "calc";
export type CalcStatus = "idle" | "running" | "done" | "error";
export type PipeKind = "casing" | "tubing";
export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";
export type StepId = "completion" | "fluids" | "ipr";
export type StepDoneMap = Record<StepId, boolean>;

export type PipeSection = {
  catalogId: number | null;
  length: string;
};

export type SurveyRow = {
  id: number;
  md: number;
  tvd: number;
  hd: number;
  angle: number;
};

export type SizeModalState = {
  open: boolean;
  kind: PipeKind;
  target: number;
  search: string;
};

export type LockView =
  | { status: "acquiring" }
  | { status: "mine"; lockedUntil?: string }
  | { status: "held-by-other"; holderName: string; lockedUntil?: string }
  | { status: "no-permission" }
  | { status: "error" };

export type TestPointDraft = { flowRate: string; flowingBottomholePressure: string };
// point1 is explicit here (not read off the IPR form) because the calc modal drafts it locally
// and only writes it back to the form right before running — the validation gate that decides
// whether Calcular is enabled runs on every keystroke, before that write-back ever happens.
export type IprCalcParams = { point1: TestPointDraft; extraTestPoints: TestPointDraft[]; desiredOilRate: string };
export type IprCalcOutcome = { ok: true } | { ok: false; message: string };
