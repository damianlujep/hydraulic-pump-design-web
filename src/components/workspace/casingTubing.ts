import { CASING_CATALOG, TUBING_CATALOG } from "@/lib/data";
import type { CatalogEntry, PipeKind, PipeSection } from "@/lib/types";

export function catalogFor(kind: PipeKind): CatalogEntry[] {
  return kind === "tubing" ? TUBING_CATALOG : CASING_CATALOG;
}

export function sizeLabel(c: CatalogEntry) {
  return `${c.od} (${c.id}) — ${c.w}`;
}

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

export function buildSections(kind: PipeKind, sections: PipeSection[]): SectionDisplay[] {
  const cat = catalogFor(kind);
  return sections.map((s, i) => {
    const c = cat[s.sizeIdx] || cat[0];
    return {
      label: sections.length === 1 ? "Tramo único" : LABELS[i],
      tint: TINTS[i % 3],
      accent: ACCENTS[i % 3],
      sizeLabel: sizeLabel(c),
      od: c.od,
      id: c.id,
      w: c.w,
      length: s.length,
      canRemove: sections.length > 1,
    };
  });
}
