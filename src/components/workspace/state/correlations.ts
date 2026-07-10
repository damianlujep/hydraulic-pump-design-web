export type CorrelationOption = { value: string; label: string };

// Return type is inferred per-element (T unions across the input tuple's literal `value`s) so
// z.enum(optionValues(CATALOG)) types the field as the exact code union, not a bare `string`.
export const optionValues = <T extends CorrelationOption>(catalog: readonly T[]): [T["value"], ...T["value"][]] => {
  const [first, ...rest] = catalog;
  return [first.value, ...rest.map((o) => o.value)] as [T["value"], ...T["value"][]];
};

export const INJECTED_FLUID_TYPE_OPTIONS = [
  { value: "OIL", label: "Petróleo" },
  { value: "WATER", label: "Agua" },
] as const;

export const GAS_SOLUBILITY_CORRELATION_OPTIONS = [
  { value: "VELARDE_BLASINGAME", label: "Velarde - Blasingame" },
  { value: "STANDING", label: "Standing" },
  { value: "VASQUEZ_BEGGS", label: "Vasquez - Beggs" },
] as const;

export const OIL_FVF_CORRELATION_OPTIONS = [
  { value: "VALKO_MCCAIN_SPIVEY", label: "Valko - McCain - Spivey" },
  { value: "STANDING", label: "Standing" },
] as const;

export const SATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS = [
  { value: "BEGGS_ROBINSON", label: "Beggs - Robinson" },
  { value: "CHEW_CONNALLY", label: "Chew - Connally" },
] as const;

export const UNDERSATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS = [
  { value: "PETROSKY_FARSHAD", label: "Petrosky - Farshad" },
  { value: "VASQUEZ_BEGGS", label: "Vasquez - Beggs" },
] as const;

export const DEAD_OIL_VISCOSITY_CORRELATION_OPTIONS = [
  { value: "RODA_V80_120", label: "RODA V80-120" },
  { value: "BEAL", label: "Beal" },
  { value: "GLASO", label: "Glaso" },
] as const;

export const WATER_FVF_VISCOSITY_CORRELATION_OPTIONS = [
  { value: "MCCAIN", label: "McCain" },
  { value: "MEEHAN", label: "Meehan" },
] as const;

export const GAS_VISCOSITY_CORRELATION_OPTIONS = [
  { value: "LEE", label: "Lee" },
  { value: "CARR_KOBAYASHI", label: "Carr - Kobayashi" },
] as const;

export const GAS_COMPRESSIBILITY_CORRELATION_OPTIONS = [
  { value: "ABOU_KASSEM", label: "Abou - Kassem" },
  { value: "HALL_YARBOROUGH", label: "Hall - Yarborough" },
] as const;

export const WATER_SURFACE_TENSION_CORRELATION_OPTIONS = [{ value: "JENNINGS_NEWMAN", label: "Jennings - Newman" }] as const;

export const OIL_SURFACE_TENSION_CORRELATION_OPTIONS = [
  { value: "ABDUL_MAJEED", label: "Abdul - Majeed" },
  { value: "BAKER_SWERDLOFF", label: "Baker - Swerdloff" },
] as const;

export const INJECTED_FLUID_HYDRAULIC_CORRELATION_OPTIONS = [
  { value: "DARCY_WEISBACH", label: "Darcy - Weisbach" },
  { value: "HAZEN_WILLIAMS", label: "Hazen - Williams" },
] as const;

export const MULTIPHASE_FLOW_CORRELATION_OPTIONS = [
  { value: "GRIFFITH", label: "Griffith" },
  { value: "BEGGS_BRILL", label: "Beggs - Brill" },
  { value: "HAGEDORN_BROWN", label: "Hagedorn - Brown" },
] as const;
