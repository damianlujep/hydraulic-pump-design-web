import type { PipeSection, StepDoneMap, SurveyRow } from "@/interfaces/workspace";
import type { DesignDataDto } from "@/lib/api/projects";
import type { components } from "@/lib/api/schema";
import type { TubularItem } from "@/lib/api/casings";
import type { IprCalculationRequest, IprCalculationResponse } from "@/lib/api/calculations";
import type { CompletionFormValues, FluidsFormValues, IprFormValues } from "./schemas";
import {
  INJECTED_FLUID_TYPE_OPTIONS,
  GAS_SOLUBILITY_CORRELATION_OPTIONS,
  OIL_FVF_CORRELATION_OPTIONS,
  SATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS,
  UNDERSATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS,
  DEAD_OIL_VISCOSITY_CORRELATION_OPTIONS,
  WATER_FVF_VISCOSITY_CORRELATION_OPTIONS,
  GAS_VISCOSITY_CORRELATION_OPTIONS,
  GAS_COMPRESSIBILITY_CORRELATION_OPTIONS,
  WATER_SURFACE_TENSION_CORRELATION_OPTIONS,
  OIL_SURFACE_TENSION_CORRELATION_OPTIONS,
  INJECTED_FLUID_HYDRAULIC_CORRELATION_OPTIONS,
  MULTIPHASE_FLOW_CORRELATION_OPTIONS,
} from "./correlations";

type CompletionDto = components["schemas"]["CompletionDto"];
type DirectionalSurveyRowDto = components["schemas"]["DirectionalSurveyRowDto"];
type FluidsDto = components["schemas"]["FluidsDto"];
type IprDto = components["schemas"]["IprDto"];

export const EMPTY_FLUIDS: FluidsFormValues = {
  oilGravityInjected: "",
  separatorPressure: "",
  separatorTemperature: "",
  gor: "",
  oilGravity: "",
  sgg: "",
  salinity: "",
  sgw: "",
  waterCut: "",
  bubblePointPressure: "",
  // Correlation/fluid-type selects always start on their current default — unlike the numeric
  // fields above, these aren't user-blank-required.
  injectedFluidType: INJECTED_FLUID_TYPE_OPTIONS[0].value,
  gasSolubilityCorrelation: GAS_SOLUBILITY_CORRELATION_OPTIONS[0].value,
  oilFvfCorrelation: OIL_FVF_CORRELATION_OPTIONS[0].value,
  saturatedOilViscosityCorrelation: SATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS[0].value,
  undersaturatedOilViscosityCorrelation: UNDERSATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS[0].value,
  deadOilViscosityCorrelation: DEAD_OIL_VISCOSITY_CORRELATION_OPTIONS[0].value,
  waterFvfViscosityCorrelation: WATER_FVF_VISCOSITY_CORRELATION_OPTIONS[0].value,
  gasViscosityCorrelation: GAS_VISCOSITY_CORRELATION_OPTIONS[0].value,
  gasCompressibilityCorrelation: GAS_COMPRESSIBILITY_CORRELATION_OPTIONS[0].value,
  waterSurfaceTensionCorrelation: WATER_SURFACE_TENSION_CORRELATION_OPTIONS[0].value,
  oilSurfaceTensionCorrelation: OIL_SURFACE_TENSION_CORRELATION_OPTIONS[0].value,
};

export const EMPTY_IPR: IprFormValues = {
  bottomholeTemperature: "",
  wellheadTemperature: "",
  reservoirPressure: "",
  flowingBottomholePressure: "",
  pumpIntakePressure: "",
  testFlowRate: "",
  maxInjectedVolume: "",
  maxInjectionPressure: "",
  jetMaxRatio: "",
  jetMinEfficiency: "",
  pistonMaxRatio: "",
  designFlowRate: "",
  flowingWellheadPressure: "",
  maxRefInjectionRate: "",
  maxInjectionPressureAdjusted: "",
  injectedFluidHydraulicCorrelation: INJECTED_FLUID_HYDRAULIC_CORRELATION_OPTIONS[0].value,
  multiphaseFlowCorrelation: MULTIPHASE_FLOW_CORRELATION_OPTIONS[0].value,
};

const numOrUndefined = (v: string): number | undefined => (v.trim() === "" ? undefined : Number(v));
const numToString = (v: number | undefined): string => (v != null ? String(v) : "");

export const toFluidsDto = (values: FluidsFormValues): FluidsDto => ({
  oilGravityInjected: numOrUndefined(values.oilGravityInjected),
  separatorPressure: numOrUndefined(values.separatorPressure),
  separatorTemperature: numOrUndefined(values.separatorTemperature),
  gor: numOrUndefined(values.gor),
  oilGravity: numOrUndefined(values.oilGravity),
  sgg: numOrUndefined(values.sgg),
  salinity: numOrUndefined(values.salinity),
  sgw: numOrUndefined(values.sgw),
  waterCut: numOrUndefined(values.waterCut),
  bubblePointPressure: numOrUndefined(values.bubblePointPressure),
  injectedFluidType: values.injectedFluidType,
  gasSolubilityCorrelation: values.gasSolubilityCorrelation,
  oilFvfCorrelation: values.oilFvfCorrelation,
  saturatedOilViscosityCorrelation: values.saturatedOilViscosityCorrelation,
  undersaturatedOilViscosityCorrelation: values.undersaturatedOilViscosityCorrelation,
  deadOilViscosityCorrelation: values.deadOilViscosityCorrelation,
  waterFvfViscosityCorrelation: values.waterFvfViscosityCorrelation,
  gasViscosityCorrelation: values.gasViscosityCorrelation,
  gasCompressibilityCorrelation: values.gasCompressibilityCorrelation,
  waterSurfaceTensionCorrelation: values.waterSurfaceTensionCorrelation,
  oilSurfaceTensionCorrelation: values.oilSurfaceTensionCorrelation,
});

export const fromFluidsDto = (dto: FluidsDto | undefined): FluidsFormValues => ({
  oilGravityInjected: numToString(dto?.oilGravityInjected),
  separatorPressure: numToString(dto?.separatorPressure),
  separatorTemperature: numToString(dto?.separatorTemperature),
  gor: numToString(dto?.gor),
  oilGravity: numToString(dto?.oilGravity),
  sgg: numToString(dto?.sgg),
  salinity: numToString(dto?.salinity),
  sgw: numToString(dto?.sgw),
  waterCut: numToString(dto?.waterCut),
  bubblePointPressure: numToString(dto?.bubblePointPressure),
  injectedFluidType: dto?.injectedFluidType ?? EMPTY_FLUIDS.injectedFluidType,
  gasSolubilityCorrelation: dto?.gasSolubilityCorrelation ?? EMPTY_FLUIDS.gasSolubilityCorrelation,
  oilFvfCorrelation: dto?.oilFvfCorrelation ?? EMPTY_FLUIDS.oilFvfCorrelation,
  saturatedOilViscosityCorrelation: dto?.saturatedOilViscosityCorrelation ?? EMPTY_FLUIDS.saturatedOilViscosityCorrelation,
  undersaturatedOilViscosityCorrelation:
    dto?.undersaturatedOilViscosityCorrelation ?? EMPTY_FLUIDS.undersaturatedOilViscosityCorrelation,
  deadOilViscosityCorrelation: dto?.deadOilViscosityCorrelation ?? EMPTY_FLUIDS.deadOilViscosityCorrelation,
  waterFvfViscosityCorrelation: dto?.waterFvfViscosityCorrelation ?? EMPTY_FLUIDS.waterFvfViscosityCorrelation,
  gasViscosityCorrelation: dto?.gasViscosityCorrelation ?? EMPTY_FLUIDS.gasViscosityCorrelation,
  gasCompressibilityCorrelation: dto?.gasCompressibilityCorrelation ?? EMPTY_FLUIDS.gasCompressibilityCorrelation,
  waterSurfaceTensionCorrelation: dto?.waterSurfaceTensionCorrelation ?? EMPTY_FLUIDS.waterSurfaceTensionCorrelation,
  oilSurfaceTensionCorrelation: dto?.oilSurfaceTensionCorrelation ?? EMPTY_FLUIDS.oilSurfaceTensionCorrelation,
});

export const toIprDto = (values: IprFormValues, iprResult: IprCalculationResponse | null): IprDto => ({
  bottomholeTemperature: numOrUndefined(values.bottomholeTemperature),
  wellheadTemperature: numOrUndefined(values.wellheadTemperature),
  reservoirPressure: numOrUndefined(values.reservoirPressure),
  flowingBottomholePressure: numOrUndefined(values.flowingBottomholePressure),
  pumpIntakePressure: numOrUndefined(values.pumpIntakePressure),
  testFlowRate: numOrUndefined(values.testFlowRate),
  maxInjectedVolume: numOrUndefined(values.maxInjectedVolume),
  maxInjectionPressure: numOrUndefined(values.maxInjectionPressure),
  jetMaxRatio: numOrUndefined(values.jetMaxRatio),
  jetMinEfficiency: numOrUndefined(values.jetMinEfficiency),
  pistonMaxRatio: numOrUndefined(values.pistonMaxRatio),
  designFlowRate: numOrUndefined(values.designFlowRate),
  flowingWellheadPressure: numOrUndefined(values.flowingWellheadPressure),
  maxRefInjectionRate: numOrUndefined(values.maxRefInjectionRate),
  maxInjectionPressureAdjusted: numOrUndefined(values.maxInjectionPressureAdjusted),
  injectedFluidHydraulicCorrelation: values.injectedFluidHydraulicCorrelation,
  multiphaseFlowCorrelation: values.multiphaseFlowCorrelation,
  // IprResultDto is shape-identical to IprCalculationResponse (backend parity test enforces this),
  // so the calc response passes straight through with no transformation.
  lastResult: iprResult ?? undefined,
  lastCorrelation: iprResult?.correlation,
  lastCurvePointCount: iprResult?.curvePoints?.length,
});

export const fromIprDto = (dto: IprDto | undefined): IprFormValues => ({
  bottomholeTemperature: numToString(dto?.bottomholeTemperature),
  wellheadTemperature: numToString(dto?.wellheadTemperature),
  reservoirPressure: numToString(dto?.reservoirPressure),
  flowingBottomholePressure: numToString(dto?.flowingBottomholePressure),
  pumpIntakePressure: numToString(dto?.pumpIntakePressure),
  testFlowRate: numToString(dto?.testFlowRate),
  maxInjectedVolume: numToString(dto?.maxInjectedVolume),
  maxInjectionPressure: numToString(dto?.maxInjectionPressure),
  jetMaxRatio: numToString(dto?.jetMaxRatio),
  jetMinEfficiency: numToString(dto?.jetMinEfficiency),
  pistonMaxRatio: numToString(dto?.pistonMaxRatio),
  designFlowRate: numToString(dto?.designFlowRate),
  flowingWellheadPressure: numToString(dto?.flowingWellheadPressure),
  maxRefInjectionRate: numToString(dto?.maxRefInjectionRate),
  maxInjectionPressureAdjusted: numToString(dto?.maxInjectionPressureAdjusted),
  injectedFluidHydraulicCorrelation: dto?.injectedFluidHydraulicCorrelation ?? EMPTY_IPR.injectedFluidHydraulicCorrelation,
  multiphaseFlowCorrelation: dto?.multiphaseFlowCorrelation ?? EMPTY_IPR.multiphaseFlowCorrelation,
});

// Sections map positionally to the Upper/Middle/Bottom slots (matching the UI's
// Superior/Intermedio/Inferior labels); each slot now carries its own selection id.
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

type SlotValues = { length?: number; outerDiameter?: number; innerDiameter?: number; selectionId?: number };

const sectionToSlot = (section: PipeSection | undefined, catalog: Map<number, TubularItem>): SlotValues => {
  if (!section) return {};
  const item = section.catalogId != null ? catalog.get(section.catalogId) : undefined;
  const length = section.length.trim() ? Number(section.length) : undefined;
  return { length, outerDiameter: item?.outerDiameter, innerDiameter: item?.innerDiameter, selectionId: section.catalogId ?? undefined };
};

const toTubularDto = (sections: PipeSection[], catalog: TubularItem[]) => {
  const byId = new Map(catalog.filter((t) => t.id != null).map((t) => [t.id as number, t]));
  return {
    count: sections.length,
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
    casingUpperLength: casing.upper.length,
    casingUpperOuterDiameter: casing.upper.outerDiameter,
    casingUpperInnerDiameter: casing.upper.innerDiameter,
    casingUpperSelectionId: casing.upper.selectionId,
    casingMiddleLength: casing.middle.length,
    casingMiddleOuterDiameter: casing.middle.outerDiameter,
    casingMiddleInnerDiameter: casing.middle.innerDiameter,
    casingMiddleSelectionId: casing.middle.selectionId,
    casingBottomLength: casing.bottom.length,
    casingBottomOuterDiameter: casing.bottom.outerDiameter,
    casingBottomInnerDiameter: casing.bottom.innerDiameter,
    casingBottomSelectionId: casing.bottom.selectionId,
    numberProductionTubings: tubing.count,
    tubingUpperLength: tubing.upper.length,
    tubingUpperOuterDiameter: tubing.upper.outerDiameter,
    tubingUpperInnerDiameter: tubing.upper.innerDiameter,
    tubingUpperSelectionId: tubing.upper.selectionId,
    tubingMiddleLength: tubing.middle.length,
    tubingMiddleOuterDiameter: tubing.middle.outerDiameter,
    tubingMiddleInnerDiameter: tubing.middle.innerDiameter,
    tubingMiddleSelectionId: tubing.middle.selectionId,
    tubingBottomLength: tubing.bottom.length,
    tubingBottomOuterDiameter: tubing.bottom.outerDiameter,
    tubingBottomInnerDiameter: tubing.bottom.innerDiameter,
    tubingBottomSelectionId: tubing.bottom.selectionId,
  };
};

const slotToSection = (slot: SlotValues, catalog: TubularItem[]): PipeSection | null => {
  const hasData = slot.length != null || slot.outerDiameter != null || slot.innerDiameter != null;
  if (!hasData) return null;
  // Prefer the slot's own selection id directly; fall back to the OD+ID lookup only for legacy
  // rows saved before per-slot ids existed (no selectionId, only OD/ID).
  const byId = slot.selectionId != null ? catalog.find((t) => t.id === slot.selectionId) : undefined;
  const catalogId = byId?.id ?? findTubularByDiameters(catalog, slot.outerDiameter, slot.innerDiameter, slot.selectionId ?? null);
  return { catalogId, length: slot.length != null ? String(slot.length) : "" };
};

const buildSectionsFromDto = (upper: SlotValues, middle: SlotValues, bottom: SlotValues, catalog: TubularItem[]): PipeSection[] => {
  const sections = [slotToSection(upper, catalog), slotToSection(middle, catalog), slotToSection(bottom, catalog)].filter(
    (s): s is PipeSection => s !== null,
  );
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
    {
      length: dto?.casingUpperLength,
      outerDiameter: dto?.casingUpperOuterDiameter,
      innerDiameter: dto?.casingUpperInnerDiameter,
      selectionId: dto?.casingUpperSelectionId,
    },
    {
      length: dto?.casingMiddleLength,
      outerDiameter: dto?.casingMiddleOuterDiameter,
      innerDiameter: dto?.casingMiddleInnerDiameter,
      selectionId: dto?.casingMiddleSelectionId,
    },
    {
      length: dto?.casingBottomLength,
      outerDiameter: dto?.casingBottomOuterDiameter,
      innerDiameter: dto?.casingBottomInnerDiameter,
      selectionId: dto?.casingBottomSelectionId,
    },
    casings,
  );
  const tubing = buildSectionsFromDto(
    {
      length: dto?.tubingUpperLength,
      outerDiameter: dto?.tubingUpperOuterDiameter,
      innerDiameter: dto?.tubingUpperInnerDiameter,
      selectionId: dto?.tubingUpperSelectionId,
    },
    {
      length: dto?.tubingMiddleLength,
      outerDiameter: dto?.tubingMiddleOuterDiameter,
      innerDiameter: dto?.tubingMiddleInnerDiameter,
      selectionId: dto?.tubingMiddleSelectionId,
    },
    {
      length: dto?.tubingBottomLength,
      outerDiameter: dto?.tubingBottomOuterDiameter,
      innerDiameter: dto?.tubingBottomInnerDiameter,
      selectionId: dto?.tubingBottomSelectionId,
    },
    tubings,
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

export const toDesignDataDto = (input: {
  completion: CompletionFormValues;
  fluids: FluidsFormValues;
  ipr: IprFormValues;
  casingSections: PipeSection[];
  tubingSections: PipeSection[];
  survey: SurveyRow[];
  casings: TubularItem[];
  tubings: TubularItem[];
  newProjectInfo: DesignDataDto["newProjectInfo"];
  iprResult: IprCalculationResponse | null;
  stepDone: StepDoneMap;
}): DesignDataDto => ({
  newProjectInfo: input.newProjectInfo,
  completion: {
    dataEntered: input.stepDone.completion,
    data: toCompletionDto(input.completion, input.casingSections, input.tubingSections, input.casings, input.tubings),
  },
  directionalSurvey: {
    dataEntered: input.survey.length > 0,
    data: toSurveyDto(input.survey),
  },
  fluids: {
    dataEntered: input.stepDone.fluids,
    data: toFluidsDto(input.fluids),
  },
  ipr: {
    dataEntered: input.stepDone.ipr,
    data: toIprDto(input.ipr, input.iprResult),
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
