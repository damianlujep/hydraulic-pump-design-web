"use client";

import type { UseFormReturn } from "react-hook-form";
import { CheckIcon, PlayIcon, SpinnerIcon } from "@/components/icons";
import { GroupCard } from "../atoms/GroupCard";
import { InputRow } from "../atoms/InputRow";
import { UnitField } from "../atoms/UnitField";
import { SelectField } from "../atoms/SelectField";
import { useWorkspace } from "../state/WorkspaceContext";
import type { IprFormValues } from "../state/schemas";
import { registerNumeric } from "../state/numericInput";
import { CorrelationFieldSelect } from "../state/CorrelationFieldSelect";
import { INJECTED_FLUID_HYDRAULIC_CORRELATION_OPTIONS, MULTIPHASE_FLOW_CORRELATION_OPTIONS } from "../state/correlations";

const PLAIN_NUMBER_CLASS =
  "w-[150px] p-[5px_9px] font-mono text-[13px] font-medium text-left bg-surface-3 border border-border rounded-[6px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]";

type FieldName = keyof IprFormValues;

// `error` is the message already computed by the caller's `errorFor(name)` — see the same note
// in FluidsForm.tsx: re-deriving it here from `form.formState` risks a second, independent read
// of RHF's Proxy-backed formState going stale relative to the row's own error text under React
// Compiler's memoization.
const FieldUnit = ({
  form,
  name,
  unit,
  error,
}: {
  form: UseFormReturn<IprFormValues>;
  name: FieldName;
  unit: string;
  error?: string;
}) => <UnitField unit={unit} placeholder="—" error={!!error} {...registerNumeric(form, name)} />;

export const IprForm = () => {
  const { state, runCalc, forms } = useWorkspace();
  const { ipr } = forms;
  const { errors, touchedFields } = ipr.formState;
  const errorFor = (name: FieldName) => (touchedFields[name] ? errors[name]?.message : undefined);

  return (
    <div className="flex flex-col gap-[14px]">
      <GroupCard title="A · Datos de la prueba de producción" bullet>
        <InputRow label="Temperatura de fondo de pozo" error={errorFor("bottomholeTemperature")}>
          <FieldUnit form={ipr} name="bottomholeTemperature" unit="°F" error={errorFor("bottomholeTemperature")} />
        </InputRow>
        <InputRow label="Temperatura de cabeza de pozo" error={errorFor("wellheadTemperature")}>
          <FieldUnit form={ipr} name="wellheadTemperature" unit="°F" error={errorFor("wellheadTemperature")} />
        </InputRow>
        <InputRow label="Modelo de reservorio para IPR">
          <SelectField defaultValue="Vogel">
            <option>Vogel</option>
          </SelectField>
        </InputRow>
        <InputRow label="Presión estática del reservorio, Ps" error={errorFor("reservoirPressure")}>
          <FieldUnit form={ipr} name="reservoirPressure" unit="psi" error={errorFor("reservoirPressure")} />
        </InputRow>
        <InputRow label="Presión de fondo fluyente, Pwf" error={errorFor("flowingBottomholePressure")}>
          <FieldUnit form={ipr} name="flowingBottomholePressure" unit="psi" error={errorFor("flowingBottomholePressure")} />
        </InputRow>
        <InputRow label="Presión de entrada a la bomba, PIP" error={errorFor("pumpIntakePressure")}>
          <FieldUnit form={ipr} name="pumpIntakePressure" unit="psi" error={errorFor("pumpIntakePressure")} />
        </InputRow>
        <InputRow label="Tasa de prueba de producción, IPR" error={errorFor("testFlowRate")}>
          <FieldUnit form={ipr} name="testFlowRate" unit="bfpd" error={errorFor("testFlowRate")} />
        </InputRow>
      </GroupCard>

      <GroupCard title="B · Parámetros limitantes para diseño" bullet>
        <InputRow label="Volumen máximo inyectado" error={errorFor("maxInjectedVolume")}>
          <FieldUnit form={ipr} name="maxInjectedVolume" unit="bipd" error={errorFor("maxInjectedVolume")} />
        </InputRow>
        <InputRow label="Presión máxima de inyección" error={errorFor("maxInjectionPressure")}>
          <FieldUnit form={ipr} name="maxInjectionPressure" unit="psi" error={errorFor("maxInjectionPressure")} />
        </InputRow>
        <InputRow label="Jet · Relación máxima Qt/Qcavitación" error={errorFor("jetMaxRatio")}>
          <input placeholder="—" inputMode="decimal" className={PLAIN_NUMBER_CLASS} {...registerNumeric(ipr, "jetMaxRatio")} />
        </InputRow>
        <InputRow label="Jet · Eficiencia mínima para diseño" error={errorFor("jetMinEfficiency")}>
          <FieldUnit form={ipr} name="jetMinEfficiency" unit="%" error={errorFor("jetMinEfficiency")} />
        </InputRow>
        <InputRow label="Pistón · Relación máxima GPM/GPMmáx" error={errorFor("pistonMaxRatio")}>
          <input placeholder="—" inputMode="decimal" className={PLAIN_NUMBER_CLASS} {...registerNumeric(ipr, "pistonMaxRatio")} />
        </InputRow>
      </GroupCard>

      <GroupCard title="C · Correlaciones hidráulicas" bullet>
        <InputRow label="Correlación para fluido inyectado">
          <CorrelationFieldSelect form={ipr} name="injectedFluidHydraulicCorrelation" catalog={INJECTED_FLUID_HYDRAULIC_CORRELATION_OPTIONS} widthPx={180} />
        </InputRow>
        <InputRow label="Correlación para flujo multifásico">
          <CorrelationFieldSelect form={ipr} name="multiphaseFlowCorrelation" catalog={MULTIPHASE_FLOW_CORRELATION_OPTIONS} widthPx={180} />
        </InputRow>
      </GroupCard>

      <GroupCard title="D · Datos de operación para diseño" bullet>
        <InputRow label="Tasa de ajuste o diseño" error={errorFor("designFlowRate")}>
          <FieldUnit form={ipr} name="designFlowRate" unit="bfpd" error={errorFor("designFlowRate")} />
        </InputRow>
        <InputRow label="Presión fluyente en la cabeza" error={errorFor("flowingWellheadPressure")}>
          <FieldUnit form={ipr} name="flowingWellheadPressure" unit="psi" error={errorFor("flowingWellheadPressure")} />
        </InputRow>
        <InputRow label="Tasa máxima de inyección referencial" error={errorFor("maxRefInjectionRate")}>
          <FieldUnit form={ipr} name="maxRefInjectionRate" unit="bipd" error={errorFor("maxRefInjectionRate")} />
        </InputRow>
        <InputRow label="Presión máxima de inyección · Ajuste" error={errorFor("maxInjectionPressureAdjusted")}>
          <FieldUnit form={ipr} name="maxInjectionPressureAdjusted" unit="psi" error={errorFor("maxInjectionPressureAdjusted")} />
        </InputRow>
      </GroupCard>

      <button
        onClick={runCalc}
        disabled={state.calcStatus === "running"}
        className="flex items-center justify-center gap-[9px] w-full p-[13px] rounded-[11px] bg-primary text-primary-fg border-none text-sm font-bold cursor-pointer shadow-[0_6px_18px_var(--primary-ring)] hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state.calcStatus === "idle" && (
          <>
            <PlayIcon />
            Ejecutar Cálculo IPR
          </>
        )}
        {state.calcStatus === "running" && (
          <>
            <SpinnerIcon size={17} className="animate-spin-fast" />
            Calculando diseño…
          </>
        )}
        {state.calcStatus === "done" && (
          <>
            <CheckIcon size={17} strokeWidth={2.8} />
            Cálculo completado
          </>
        )}
        {state.calcStatus === "error" && "Error en el cálculo — reintentar"}
      </button>
    </div>
  );
};
