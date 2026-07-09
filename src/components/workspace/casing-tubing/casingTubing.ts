import type { TubularItem } from "@/lib/api/casings";
import type { PipeSection } from "@/interfaces/workspace";

export const sizeLabel = (t: TubularItem) => `${t.outerDiameter?.toFixed(3)} (${t.innerDiameter?.toFixed(3)}) — ${t.nominalWeight}`;

const LABELS = ["Superior", "Intermedio", "Inferior"];
const TINTS = ["var(--tint-blue)", "var(--tint-amber)", "var(--tint-green)"];
const ACCENTS = ["var(--data-blue)", "var(--amber)", "var(--data-green)"];

export type SectionDisplay = {
  label: string;
  tint: string;
  accent: string;
  sizeLabel: string;
  od: string;
  id: string;
  w: string;
  length: string;
  canRemove: boolean;
};

export const buildSections = (sections: PipeSection[], catalog: TubularItem[]): SectionDisplay[] => {
  const byId = new Map(catalog.filter((t) => t.id != null).map((t) => [t.id as number, t]));
  return sections.map((s, i) => {
    const item = s.catalogId != null ? byId.get(s.catalogId) : undefined;
    return {
      label: sections.length === 1 ? "Tramo único" : LABELS[i],
      tint: TINTS[i % 3],
      accent: ACCENTS[i % 3],
      sizeLabel: item ? sizeLabel(item) : "Seleccionar…",
      od: item?.outerDiameter != null ? item.outerDiameter.toFixed(3) : "—",
      id: item?.innerDiameter != null ? item.innerDiameter.toFixed(3) : "—",
      w: item?.nominalWeight ?? "—",
      length: s.length,
      canRemove: sections.length > 1,
    };
  });
};
