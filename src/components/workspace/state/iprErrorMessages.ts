// The backend's IPR calc DOMAIN_ERROR messages are English prose, not error codes — there's no
// i18n key to switch on. These are fixed templates (some with a computed number embedded, e.g.
// the max achievable oil rate), so a regex match + Spanish rewrite is cheap and reliable without
// a backend change. If the backend's wording ever shifts, the pattern just stops matching and the
// raw English message shows instead (see the fallback in translateIprDomainError) — degraded, but
// never hidden.
type ErrorPattern = { regex: RegExp; translate: (match: RegExpMatchArray) => string };

const IPR_ERROR_PATTERNS: ErrorPattern[] = [
  {
    regex: /^desiredOilRate exceeds the maximum achievable oil rate of ([\d.]+) STB\/d for this well$/,
    translate: (m) => `La tasa deseada de petróleo supera la tasa máxima alcanzable de ${m[1]} STB/d para este pozo`,
  },
  {
    regex: /^desiredOilRate requires oil production; waterCut must be less than 1$/,
    translate: () => "La tasa deseada de petróleo requiere producción de petróleo — el BSW debe ser menor a 1",
  },
  {
    regex: /^FETKOVICH regression requires at least 2 test points below the bubble point.*$/,
    translate: () =>
      "Fetkovich requiere al menos 2 puntos de prueba con Pwf por debajo de Pb (presión de burbuja) y con caída de presión medible — agregue más puntos por debajo de Pb",
  },
  {
    regex: /^FETKOVICH correlation requires at least 2 test points$/,
    translate: () => "Fetkovich requiere al menos 2 puntos de prueba",
  },
  {
    regex: /^VOGEL correlation requires exactly 1 test point$/,
    translate: () => "Vogel requiere exactamente 1 punto de prueba",
  },
];

export const translateIprDomainError = (message: string): string => {
  for (const pattern of IPR_ERROR_PATTERNS) {
    const match = message.match(pattern.regex);
    if (match) return pattern.translate(match);
  }
  return message;
};
