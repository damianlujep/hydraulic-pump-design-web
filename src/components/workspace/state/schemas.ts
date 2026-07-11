import { z } from "zod";
import {
  optionValues,
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
  RESERVOIR_MODEL_OPTIONS,
} from "./correlations";

const requiredNumber = (message = "Campo requerido") =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((v) => Number.isFinite(Number(v)), "Debe ser un número válido");

const positiveNumber = (message = "Campo requerido") =>
  requiredNumber(message).refine((v) => Number(v) > 0, "Debe ser mayor a 0");

export const completionSchema = z.object({
  lengthOfShots: positiveNumber(),
  averageShotDepth: positiveNumber(),
  pumpSettlementLength: positiveNumber(),
  pumpSettlementDepth: positiveNumber(),
});
export type CompletionFormValues = z.infer<typeof completionSchema>;

// "Fluids step done" = every editable numeric field on the panel is filled — only
// bubblePointPressure and waterCut are actually sent to the calculation endpoint (see
// buildIprRequest in designData.ts); the rest aren't persistable yet (no backend fluids/PVT
// step), but the step-completion gate still requires them per the user's step-done contract.
export const fluidsSchema = z.object({
  oilGravityInjected: positiveNumber(),
  separatorPressure: positiveNumber(),
  separatorTemperature: positiveNumber(),
  gor: positiveNumber(),
  oilGravity: positiveNumber(),
  sgg: positiveNumber(),
  salinity: positiveNumber(),
  sgw: positiveNumber(),
  waterCut: requiredNumber().refine((v) => Number(v) >= 0 && Number(v) <= 1, "Debe estar entre 0 y 1"),
  bubblePointPressure: positiveNumber(),
  // Correlation/fluid-type selects — always have a valid default (most are fixed/disabled in the
  // UI for now), so these never block step validity the way the numeric fields above can.
  injectedFluidType: z.enum(optionValues(INJECTED_FLUID_TYPE_OPTIONS)),
  gasSolubilityCorrelation: z.enum(optionValues(GAS_SOLUBILITY_CORRELATION_OPTIONS)),
  oilFvfCorrelation: z.enum(optionValues(OIL_FVF_CORRELATION_OPTIONS)),
  saturatedOilViscosityCorrelation: z.enum(optionValues(SATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS)),
  undersaturatedOilViscosityCorrelation: z.enum(optionValues(UNDERSATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS)),
  deadOilViscosityCorrelation: z.enum(optionValues(DEAD_OIL_VISCOSITY_CORRELATION_OPTIONS)),
  waterFvfViscosityCorrelation: z.enum(optionValues(WATER_FVF_VISCOSITY_CORRELATION_OPTIONS)),
  gasViscosityCorrelation: z.enum(optionValues(GAS_VISCOSITY_CORRELATION_OPTIONS)),
  gasCompressibilityCorrelation: z.enum(optionValues(GAS_COMPRESSIBILITY_CORRELATION_OPTIONS)),
  waterSurfaceTensionCorrelation: z.enum(optionValues(WATER_SURFACE_TENSION_CORRELATION_OPTIONS)),
  oilSurfaceTensionCorrelation: z.enum(optionValues(OIL_SURFACE_TENSION_CORRELATION_OPTIONS)),
});
export type FluidsFormValues = z.infer<typeof fluidsSchema>;

// "IPR step done" = every editable numeric field is filled AND the calculation has succeeded
// with the current inputs (tracked separately via the iprResult/fingerprint in WorkspaceContext).
// reservoirPressure, flowingBottomholePressure and testFlowRate feed the actual calculation
// request as test point 1 (see buildIprRequest in designData.ts) — under FETKOVICH, additional
// points 2..n are collected ephemerally in reducer state (IprCalcModal), not in this form. The
// rest of the numeric fields aren't sent to the backend yet, but still gate step completion per
// the user's step-done contract. The cross-field Pwf < Ps rule mirrors the backend's
// /api/v1/calculations/ipr validation.
export const iprSchema = z
  .object({
    bottomholeTemperature: positiveNumber(),
    wellheadTemperature: positiveNumber(),
    reservoirPressure: positiveNumber(),
    flowingBottomholePressure: requiredNumber().refine((v) => Number(v) >= 0, "No puede ser negativo"),
    pumpIntakePressure: positiveNumber(),
    testFlowRate: positiveNumber(),
    maxInjectedVolume: positiveNumber(),
    maxInjectionPressure: positiveNumber(),
    jetMaxRatio: positiveNumber(),
    jetMinEfficiency: positiveNumber(),
    pistonMaxRatio: positiveNumber(),
    designFlowRate: positiveNumber(),
    flowingWellheadPressure: positiveNumber(),
    maxRefInjectionRate: positiveNumber(),
    maxInjectionPressureAdjusted: positiveNumber(),
    // Reservoir model for the IPR calculation (Vogel/Fetkovich) — not persisted in IprDto (only
    // lastCorrelation, seeded from the last successful calc, is), same non-persistence treatment
    // as the ephemeral extra test points/desiredOilRate in reducer state.
    correlation: z.enum(optionValues(RESERVOIR_MODEL_OPTIONS)),
    // Hydraulic correlation selects — always have a valid default.
    injectedFluidHydraulicCorrelation: z.enum(optionValues(INJECTED_FLUID_HYDRAULIC_CORRELATION_OPTIONS)),
    multiphaseFlowCorrelation: z.enum(optionValues(MULTIPHASE_FLOW_CORRELATION_OPTIONS)),
  })
  .refine((v) => Number(v.flowingBottomholePressure) < Number(v.reservoirPressure), {
    message: "Pwf debe ser menor que Ps",
    path: ["flowingBottomholePressure"],
  });
export type IprFormValues = z.infer<typeof iprSchema>;
