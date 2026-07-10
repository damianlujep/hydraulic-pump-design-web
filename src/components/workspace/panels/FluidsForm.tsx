"use client";

import type { UseFormReturn } from "react-hook-form";
import { LockIcon } from "@/components/icons";
import { GroupCard } from "../atoms/GroupCard";
import { InputRow } from "../atoms/InputRow";
import { UnitField } from "../atoms/UnitField";
import { useWorkspace } from "../state/WorkspaceContext";
import type { FluidsFormValues } from "../state/schemas";
import { registerNumeric } from "../state/numericInput";
import { CorrelationFieldSelect } from "../state/CorrelationFieldSelect";
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
} from "../state/correlations";

const PLAIN_NUMBER_CLASS =
  "w-[150px] p-[5px_9px] font-mono text-[13px] font-medium text-left bg-surface-3 border border-border rounded-[6px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]";

type FieldName = keyof FluidsFormValues;

// `error` is the message already computed by the caller's `errorFor(name)` — FieldUnit must not
// re-derive it from `form.formState` itself. That would be a second, independent read of RHF's
// Proxy-backed formState, and under React Compiler's memoization the two reads can go out of
// sync (this component's props otherwise look unchanged to a shallow prop comparison), leaving
// the input's red border stuck out of step with the row's error message.
const FieldUnit = ({
  form,
  name,
  unit,
  error,
}: {
  form: UseFormReturn<FluidsFormValues>;
  name: FieldName;
  unit: string;
  error?: string;
}) => <UnitField unit={unit} placeholder="—" error={!!error} {...registerNumeric(form, name)} />;

export const FluidsForm = () => {
  const {
    forms: { fluids },
  } = useWorkspace();
  const { errors, touchedFields } = fluids.formState;

  const errorFor = (name: FieldName) => (touchedFields[name] ? errors[name]?.message : undefined);

  return (
    <div className="flex flex-col gap-[14px]">
      <GroupCard title="Fluido motriz inyectado">
        <InputRow label="Fluido motriz inyectado">
          <CorrelationFieldSelect form={fluids} name="injectedFluidType" catalog={INJECTED_FLUID_TYPE_OPTIONS} />
        </InputRow>
        <InputRow label="Gravedad del petróleo inyectado" error={errorFor("oilGravityInjected")}>
          <FieldUnit form={fluids} name="oilGravityInjected" unit="°API" error={errorFor("oilGravityInjected")} />
        </InputRow>
      </GroupCard>

      <GroupCard title="Fluido producido">
        <InputRow label="Presión de separador" error={errorFor("separatorPressure")}>
          <FieldUnit form={fluids} name="separatorPressure" unit="psi" error={errorFor("separatorPressure")} />
        </InputRow>
        <InputRow label="Temperatura de separador" error={errorFor("separatorTemperature")}>
          <FieldUnit form={fluids} name="separatorTemperature" unit="°F" error={errorFor("separatorTemperature")} />
        </InputRow>
        <InputRow label="Relación gas-petróleo, GOR" error={errorFor("gor")}>
          <FieldUnit form={fluids} name="gor" unit="scf/stb" error={errorFor("gor")} />
        </InputRow>
        <InputRow label="Gravedad del petróleo" error={errorFor("oilGravity")}>
          <FieldUnit form={fluids} name="oilGravity" unit="°API" error={errorFor("oilGravity")} />
        </InputRow>
        <InputRow label="Gravedad específica del gas, SGg" error={errorFor("sgg")}>
          <input placeholder="—" inputMode="decimal" className={PLAIN_NUMBER_CLASS} {...registerNumeric(fluids, "sgg")} />
        </InputRow>
        <InputRow label="Salinidad del agua de formación" error={errorFor("salinity")}>
          <FieldUnit form={fluids} name="salinity" unit="ppm Cl⁻" error={errorFor("salinity")} />
        </InputRow>
        <InputRow label="Grav. específica, agua inyectada, SGw" error={errorFor("sgw")}>
          <input placeholder="—" inputMode="decimal" className={PLAIN_NUMBER_CLASS} {...registerNumeric(fluids, "sgw")} />
        </InputRow>
        <InputRow label="Corte de agua producida, BSW" error={errorFor("waterCut")}>
          <FieldUnit form={fluids} name="waterCut" unit="fracción" error={errorFor("waterCut")} />
        </InputRow>
      </GroupCard>

      <GroupCard title="Correlaciones PVT">
        <InputRow label="Presión de burbuja, Pb" error={errorFor("bubblePointPressure")}>
          <FieldUnit form={fluids} name="bubblePointPressure" unit="psi" error={errorFor("bubblePointPressure")} />
        </InputRow>
        <InputRow label="Solubilidad del gas, Rs (scf/stb)" labelColor="faint">
          <div className="flex items-center gap-[7px]" title="Fijado por la correlación de Pb">
            <span className="inline-flex text-text-faint">
              <LockIcon size={13} />
            </span>
            <CorrelationFieldSelect
              form={fluids}
              name="gasSolubilityCorrelation"
              catalog={GAS_SOLUBILITY_CORRELATION_OPTIONS}
              widthPx={180}
              fontSizePx={12}
              disabled
            />
          </div>
        </InputRow>
        <InputRow label="Factor volumétrico Bo (rb/stb)">
          <CorrelationFieldSelect form={fluids} name="oilFvfCorrelation" catalog={OIL_FVF_CORRELATION_OPTIONS} widthPx={180} fontSizePx={12} disabled />
        </InputRow>
        <InputRow label="Viscosidad Uo saturado (cp)">
          <CorrelationFieldSelect
            form={fluids}
            name="saturatedOilViscosityCorrelation"
            catalog={SATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS}
            widthPx={180}
            fontSizePx={12}
            disabled
          />
        </InputRow>
        <InputRow label="Viscosidad Uo subsaturado (cp)">
          <CorrelationFieldSelect
            form={fluids}
            name="undersaturatedOilViscosityCorrelation"
            catalog={UNDERSATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS}
            widthPx={180}
            fontSizePx={12}
            disabled
          />
        </InputRow>
        <InputRow label="Viscosidad Uo muerto (cp)">
          <CorrelationFieldSelect
            form={fluids}
            name="deadOilViscosityCorrelation"
            catalog={DEAD_OIL_VISCOSITY_CORRELATION_OPTIONS}
            widthPx={180}
            fontSizePx={12}
          />
        </InputRow>
        <InputRow label="Agua, Bw (rb/stb), Uw (cp)">
          <CorrelationFieldSelect
            form={fluids}
            name="waterFvfViscosityCorrelation"
            catalog={WATER_FVF_VISCOSITY_CORRELATION_OPTIONS}
            widthPx={180}
            fontSizePx={12}
            disabled
          />
        </InputRow>
        <InputRow label="Viscosidad del gas, Ug (cp)">
          <CorrelationFieldSelect
            form={fluids}
            name="gasViscosityCorrelation"
            catalog={GAS_VISCOSITY_CORRELATION_OPTIONS}
            widthPx={180}
            fontSizePx={12}
            disabled
          />
        </InputRow>
        <InputRow label="Factor de compresibilidad, Z">
          <CorrelationFieldSelect
            form={fluids}
            name="gasCompressibilityCorrelation"
            catalog={GAS_COMPRESSIBILITY_CORRELATION_OPTIONS}
            widthPx={180}
            fontSizePx={12}
            disabled
          />
        </InputRow>
        <InputRow label="Tensión superficial agua (dina/cm)">
          <CorrelationFieldSelect
            form={fluids}
            name="waterSurfaceTensionCorrelation"
            catalog={WATER_SURFACE_TENSION_CORRELATION_OPTIONS}
            widthPx={180}
            fontSizePx={12}
            disabled
          />
        </InputRow>
        <InputRow label="Tensión superficial petróleo (dina/cm)">
          <CorrelationFieldSelect
            form={fluids}
            name="oilSurfaceTensionCorrelation"
            catalog={OIL_SURFACE_TENSION_CORRELATION_OPTIONS}
            widthPx={180}
            fontSizePx={12}
            disabled
          />
        </InputRow>
      </GroupCard>
    </div>
  );
};
