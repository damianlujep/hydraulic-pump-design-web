import type { ChangeEvent } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

// Digits + one decimal point, capped at 3 decimals — matches the 1.000 field format used
// throughout completion/fluids/IPR/survey. No minus sign: every numeric field in these forms
// is validated as positive or non-negative, so a leading "-" is never a valid partial value.
export const sanitizeNumeric = (raw: string): string => {
  let value = raw.replace(/[^0-9.]/g, "");
  const dot = value.indexOf(".");
  if (dot !== -1) value = value.slice(0, dot + 1) + value.slice(dot + 1).replace(/\./g, "");
  const decimals = value.indexOf(".");
  if (decimals !== -1 && value.length > decimals + 4) value = value.slice(0, decimals + 4);
  return value;
};

// Wraps RHF's register() so keystrokes are sanitized before the form ever sees them — mutating
// the DOM input's value in place works because register() binds inputs uncontrolled (via ref),
// so there's no `value` prop fighting the correction.
export const registerNumeric = <T extends FieldValues>(form: UseFormReturn<T>, name: Path<T>) => {
  const field = form.register(name);
  return {
    ...field,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeNumeric(e.target.value);
      if (sanitized !== e.target.value) e.target.value = sanitized;
      return field.onChange(e);
    },
  };
};
