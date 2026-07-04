export type TabId = "completion" | "fluids" | "ipr" | "calc";
export type CalcStatus = "idle" | "running" | "done";
export type PipeKind = "casing" | "tubing";

export type CatalogEntry = {
  n: string;
  od: string;
  id: string;
  w: string;
};

export type PipeSection = {
  sizeIdx: number;
  length: string;
};

export type SurveyStation = {
  n: number;
  md: number;
  tvd: number;
  hd: number;
  ang: number;
};

export type SurveyFullStation = {
  n: number;
  md: string;
  tvd: string;
  hd: string;
  ang: number;
};

export type Project = {
  name: string;
  well: string;
  type: string;
  campo: string;
  isCloud: boolean;
  local: boolean;
  modified: string;
};

export type SizeModalState = {
  open: boolean;
  kind: PipeKind;
  target: number;
  search: string;
};
