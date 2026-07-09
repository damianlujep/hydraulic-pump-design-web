import { z } from "zod";

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
});
export type FluidsFormValues = z.infer<typeof fluidsSchema>;

// "IPR step done" = every editable numeric field is filled AND the calculation has succeeded
// with the current inputs (tracked separately via the iprResult/fingerprint in WorkspaceContext).
// Only reservoirPressure, flowingBottomholePressure and testFlowRate feed the actual calculation
// request (Vogel, single test point) — the rest aren't sent to the backend yet, but still gate
// step completion per the user's step-done contract. The cross-field Pwf < Ps rule mirrors the
// backend's /api/v1/calculations/ipr validation for the single-test-point (Vogel) case.
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
  })
  .refine((v) => Number(v.flowingBottomholePressure) < Number(v.reservoirPressure), {
    message: "Pwf debe ser menor que Ps",
    path: ["flowingBottomholePressure"],
  });
export type IprFormValues = z.infer<typeof iprSchema>;
