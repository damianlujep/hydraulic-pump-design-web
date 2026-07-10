import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { SelectField } from "../atoms/SelectField";
import type { CorrelationOption } from "./correlations";

export const CorrelationFieldSelect = <T extends FieldValues>({
  form,
  name,
  catalog,
  widthPx,
  fontSizePx,
  disabled,
}: {
  form: UseFormReturn<T>;
  name: Path<T>;
  catalog: readonly CorrelationOption[];
  widthPx?: number;
  fontSizePx?: number;
  disabled?: boolean;
}) => (
  <SelectField widthPx={widthPx} fontSizePx={fontSizePx} disabled={disabled} {...form.register(name)}>
    {catalog.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </SelectField>
);
