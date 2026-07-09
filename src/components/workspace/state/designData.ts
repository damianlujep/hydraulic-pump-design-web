import type { PipeSection, SurveyRow } from "@/interfaces/workspace";
import type { DesignDataDto } from "@/lib/api/projects";
import type { components } from "@/lib/api/schema";
import type { TubularItem } from "@/lib/api/casings";
import type { IprCalculationRequest } from "@/lib/api/calculations";
import type { CompletionFormValues, FluidsFormValues, IprFormValues } from "./schemas";

type CompletionDto = components["schemas"]["CompletionDto"];
type DirectionalSurveyRowDto = components["schemas"]["DirectionalSurveyRowDto"];

// The DTO has one casingSelectionId/tubingSelectionId but per-slot OD/ID/length — sections map
// positionally to the Upper/Middle/Bottom slots (matching the UI's Superior/Intermedio/Inferior
// labels), and the selection id is taken from the bottom-most section that has a pick.
export const findTubularByDiameters = (
  catalog: TubularItem[],
  outerDiameter?: number,
  innerDiameter?: number,
  preferId?: number | null,
): number | null => {
  if (outerDiameter == null || innerDiameter == null) return null;
  const matches = catalog.filter((t) => t.outerDiameter === outerDiameter && t.innerDiameter === innerDiameter);
  if (matches.length === 0) return null;
  const preferred = preferId != null ? matches.find((t) => t.id === preferId) : undefined;
  return (preferred ?? matches[0]).id ?? null;
};

type SlotValues = { length?: number; outerDiameter?: number; innerDiameter?: number };

const sectionToSlot = (section: PipeSection | undefined, catalog: Map<number, TubularItem>): SlotValues => {
  if (!section) return {};
  const item = section.catalogId != null ? catalog.get(section.catalogId) : undefined;
  const length = section.length.trim() ? Number(section.length) : undefined;
  return { length, outerDiameter: item?.outerDiameter, innerDiameter: item?.innerDiameter };
};

const toTubularDto = (sections: PipeSection[], catalog: TubularItem[]) => {
  const byId = new Map(catalog.filter((t) => t.id != null).map((t) => [t.id as number, t]));
  const bottomMost = [...sections].reverse().find((s) => s.catalogId != null);
  return {
    count: sections.length,
    selectionId: bottomMost?.catalogId ?? undefined,
    upper: sectionToSlot(sections[0], byId),
    middle: sectionToSlot(sections[1], byId),
    bottom: sectionToSlot(sections[2], byId),
  };
};

export const toCompletionDto = (
  completion: CompletionFormValues,
  casingSections: PipeSection[],
  tubingSections: PipeSection[],
  casings: TubularItem[],
  tubings: TubularItem[],
): CompletionDto => {
  const casing = toTubularDto(casingSections, casings);
  const tubing = toTubularDto(tubingSections, tubings);

  return {
    lengthOfShots: Number(completion.lengthOfShots) || undefined,
    averageShotDepth: Number(completion.averageShotDepth) || undefined,
    pumpSettlementLength: Number(completion.pumpSettlementLength) || undefined,
    pumpSettlementDepth: Number(completion.pumpSettlementDepth) || undefined,
    numberCasingPipes: casing.count,
    casingSelectionId: casing.selectionId,
    casingUpperLength: casing.upper.length,
    casingUpperOuterDiameter: casing.upper.outerDiameter,
    casingUpperInnerDiameter: casing.upper.innerDiameter,
    casingMiddleLength: casing.middle.length,
    casingMiddleOuterDiameter: casing.middle.outerDiameter,
    casingMiddleInnerDiameter: casing.middle.innerDiameter,
    casingBottomLength: casing.bottom.length,
    casingBottomOuterDiameter: casing.bottom.outerDiameter,
    casingBottomInnerDiameter: casing.bottom.innerDiameter,
    numberProductionTubings: tubing.count,
    tubingSelectionId: tubing.selectionId,
    tubingUpperLength: tubing.upper.length,
    tubingUpperOuterDiameter: tubing.upper.outerDiameter,
    tubingUpperInnerDiameter: tubing.upper.innerDiameter,
    tubingMiddleLength: tubing.middle.length,
    tubingMiddleOuterDiameter: tubing.middle.outerDiameter,
    tubingMiddleInnerDiameter: tubing.middle.innerDiameter,
    tubingBottomLength: tubing.bottom.length,
    tubingBottomOuterDiameter: tubing.bottom.outerDiameter,
    tubingBottomInnerDiameter: tubing.bottom.innerDiameter,
  };
};

const slotToSection = (slot: SlotValues, catalog: TubularItem[], selectionId?: number): PipeSection | null => {
  const hasData = slot.length != null || slot.outerDiameter != null || slot.innerDiameter != null;
  if (!hasData) return null;
  const catalogId = findTubularByDiameters(catalog, slot.outerDiameter, slot.innerDiameter, selectionId ?? null);
  return { catalogId, length: slot.length != null ? String(slot.length) : "" };
};

const buildSectionsFromDto = (
  upper: SlotValues,
  middle: SlotValues,
  bottom: SlotValues,
  catalog: TubularItem[],
  selectionId?: number,
): PipeSection[] => {
  const sections = [
    slotToSection(upper, catalog, selectionId),
    slotToSection(middle, catalog, selectionId),
    slotToSection(bottom, catalog, selectionId),
  ].filter((s): s is PipeSection => s !== null);
  return sections.length > 0 ? sections : [{ catalogId: null, length: "" }];
};

export const fromCompletionDto = (
  dto: CompletionDto | undefined,
  casings: TubularItem[],
  tubings: TubularItem[],
): { completion: CompletionFormValues; casing: PipeSection[]; tubing: PipeSection[] } => {
  const completion: CompletionFormValues = {
    lengthOfShots: dto?.lengthOfShots != null ? String(dto.lengthOfShots) : "",
    averageShotDepth: dto?.averageShotDepth != null ? String(dto.averageShotDepth) : "",
    pumpSettlementLength: dto?.pumpSettlementLength != null ? String(dto.pumpSettlementLength) : "",
    pumpSettlementDepth: dto?.pumpSettlementDepth != null ? String(dto.pumpSettlementDepth) : "",
  };

  const casing = buildSectionsFromDto(
    { length: dto?.casingUpperLength, outerDiameter: dto?.casingUpperOuterDiameter, innerDiameter: dto?.casingUpperInnerDiameter },
    { length: dto?.casingMiddleLength, outerDiameter: dto?.casingMiddleOuterDiameter, innerDiameter: dto?.casingMiddleInnerDiameter },
    { length: dto?.casingBottomLength, outerDiameter: dto?.casingBottomOuterDiameter, innerDiameter: dto?.casingBottomInnerDiameter },
    casings,
    dto?.casingSelectionId,
  );
  const tubing = buildSectionsFromDto(
    { length: dto?.tubingUpperLength, outerDiameter: dto?.tubingUpperOuterDiameter, innerDiameter: dto?.tubingUpperInnerDiameter },
    { length: dto?.tubingMiddleLength, outerDiameter: dto?.tubingMiddleOuterDiameter, innerDiameter: dto?.tubingMiddleInnerDiameter },
    { length: dto?.tubingBottomLength, outerDiameter: dto?.tubingBottomOuterDiameter, innerDiameter: dto?.tubingBottomInnerDiameter },
    tubings,
    dto?.tubingSelectionId,
  );

  return { completion, casing, tubing };
};

export const toSurveyDto = (rows: SurveyRow[]): DirectionalSurveyRowDto[] =>
  rows.map((r) => ({ id: r.id, md: r.md, tvd: r.tvd, hd: r.hd, angle: r.angle }));

export const fromSurveyDto = (rows: DirectionalSurveyRowDto[] | undefined): SurveyRow[] =>
  (rows ?? []).map((r, i) => ({
    id: r.id ?? i + 1,
    md: r.md ?? 0,
    tvd: r.tvd ?? 0,
    hd: r.hd ?? 0,
    angle: r.angle ?? 0,
  }));

export const toDesignDataDto = (
  completionValues: CompletionFormValues,
  casingSections: PipeSection[],
  tubingSections: PipeSection[],
  survey: SurveyRow[],
  casings: TubularItem[],
  tubings: TubularItem[],
  newProjectInfo: DesignDataDto["newProjectInfo"],
  completionDone: boolean,
): DesignDataDto => ({
  newProjectInfo,
  completion: {
    dataEntered: completionDone,
    data: toCompletionDto(completionValues, casingSections, tubingSections, casings, tubings),
  },
  directionalSurvey: {
    dataEntered: survey.length > 0,
    data: toSurveyDto(survey),
  },
});

export type IprFingerprintInput = { ipr: IprFormValues; fluids: FluidsFormValues };

export const computeIprFingerprint = (input: IprFingerprintInput): string => JSON.stringify(input);

export type BuildIprRequestResult =
  | { request: IprCalculationRequest; fingerprint: string }
  | { fieldError: { message: string } };

// Cross-form rule the per-field zod schemas can't express alone: Pb (fluids) must not exceed
// Ps (ipr). All other backend rules are already covered by `iprSchema`.
export const buildIprRequest = (ipr: IprFormValues, fluids: FluidsFormValues): BuildIprRequestResult => {
  const reservoirPressure = Number(ipr.reservoirPressure);
  const bubblePointPressure = Number(fluids.bubblePointPressure);
  if (bubblePointPressure > reservoirPressure) {
    return { fieldError: { message: "Pb debe ser menor o igual que Ps" } };
  }
  return {
    request: {
      reservoirPressure,
      bubblePointPressure,
      waterCut: Number(fluids.waterCut),
      correlation: "VOGEL",
      testPoints: [
        { flowRate: Number(ipr.testFlowRate), flowingBottomholePressure: Number(ipr.flowingBottomholePressure) },
      ],
      curvePointCount: 40,
    },
    fingerprint: computeIprFingerprint({ ipr, fluids }),
  };
};
