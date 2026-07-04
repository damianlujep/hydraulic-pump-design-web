"use client";

import { CheckIcon, PlayIcon, SpinnerIcon } from "@/components/icons";
import { GroupCard } from "../GroupCard";
import { InputRow } from "../InputRow";
import { UnitField } from "../UnitField";
import { SelectField } from "../SelectField";
import { useWorkspace } from "../WorkspaceContext";

const PLAIN_NUMBER_CLASS =
  "w-[150px] p-[5px_9px] font-mono text-[13px] font-medium text-left bg-surface-3 border border-border rounded-[6px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]";

export function IprForm() {
  const { state, runCalc } = useWorkspace();

  return (
    <div className="flex flex-col gap-[14px]">
      <GroupCard title="A · Datos de la prueba de producción" bullet>
        <InputRow label="Temperatura de fondo de pozo">
          <UnitField unit="°F" defaultValue="185" />
        </InputRow>
        <InputRow label="Temperatura de cabeza de pozo">
          <UnitField unit="°F" defaultValue="150" />
        </InputRow>
        <InputRow label="Modelo de reservorio para IPR">
          <SelectField defaultValue="Ambos">
            <option>Ambos</option>
            <option>Vogel</option>
            <option>IPR lineal (Darcy)</option>
            <option>Fetkovich</option>
          </SelectField>
        </InputRow>
        <InputRow label="Presión estática del reservorio, Ps">
          <UnitField unit="psi" defaultValue="2300" />
        </InputRow>
        <InputRow label="Presión de fondo fluyente, Pwf">
          <UnitField unit="psi" defaultValue="1781" />
        </InputRow>
        <InputRow label="Presión de entrada a la bomba, PIP">
          <UnitField unit="psi" defaultValue="1720" />
        </InputRow>
        <InputRow label="Tasa de prueba de producción, IPR">
          <UnitField unit="bfpd" defaultValue="520" />
        </InputRow>
      </GroupCard>

      <GroupCard title="B · Parámetros limitantes para diseño" bullet>
        <InputRow label="Volumen máximo inyectado">
          <UnitField unit="bipd" defaultValue="3200" />
        </InputRow>
        <InputRow label="Presión máxima de inyección">
          <UnitField unit="psi" defaultValue="2900" />
        </InputRow>
        <InputRow label="Jet · Relación máxima Qt/Qcavitación">
          <input defaultValue="1" className={PLAIN_NUMBER_CLASS} />
        </InputRow>
        <InputRow label="Jet · Eficiencia mínima para diseño">
          <UnitField unit="%" defaultValue="30" />
        </InputRow>
        <InputRow label="Pistón · Relación máxima GPM/GPMmáx">
          <input defaultValue="0.75" className={PLAIN_NUMBER_CLASS} />
        </InputRow>
      </GroupCard>

      <GroupCard title="C · Correlaciones hidráulicas" bullet>
        <InputRow label="Correlación para fluido inyectado">
          <SelectField widthPx={180} defaultValue="Darcy - Weisbach">
            <option>Darcy - Weisbach</option>
            <option>Hazen - Williams</option>
          </SelectField>
        </InputRow>
        <InputRow label="Correlación para flujo multifásico">
          <SelectField widthPx={180} defaultValue="Griffith">
            <option>Griffith</option>
            <option>Beggs - Brill</option>
            <option>Hagedorn - Brown</option>
          </SelectField>
        </InputRow>
      </GroupCard>

      <GroupCard title="D · Datos de operación para diseño" bullet>
        <InputRow label="Tasa de ajuste o diseño">
          <UnitField unit="bfpd" defaultValue="520" />
        </InputRow>
        <InputRow label="Presión fluyente en la cabeza">
          <UnitField unit="psi" defaultValue="170" />
        </InputRow>
        <InputRow label="Tasa máxima de inyección referencial">
          <UnitField unit="bipd" defaultValue="1923" />
        </InputRow>
        <InputRow label="Presión máxima de inyección · Ajuste">
          <UnitField unit="psi" defaultValue="1800" />
        </InputRow>
      </GroupCard>

      <button
        onClick={runCalc}
        className="flex items-center justify-center gap-[9px] w-full p-[13px] rounded-[11px] bg-primary text-primary-fg border-none text-sm font-bold cursor-pointer shadow-[0_6px_18px_var(--primary-ring)] hover:bg-primary-hover"
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
            Cálculo completado · 14 diseños viables
          </>
        )}
      </button>
    </div>
  );
}
