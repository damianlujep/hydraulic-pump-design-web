"use client";

import type { UseFormReturn } from "react-hook-form";
import { LockIcon } from "@/components/icons";
import { GroupCard } from "../atoms/GroupCard";
import { InputRow } from "../atoms/InputRow";
import { UnitField } from "../atoms/UnitField";
import { SelectField } from "../atoms/SelectField";
import { useWorkspace } from "../state/WorkspaceContext";
import type { FluidsFormValues } from "../state/schemas";
import { registerNumeric } from "../state/numericInput";

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
          <SelectField defaultValue="Petróleo">
            <option>Petróleo</option>
            <option>Agua</option>
          </SelectField>
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
            <SelectField widthPx={180} fontSizePx={12} defaultValue="Velarde - Blasingame" disabled>
              <option>Velarde - Blasingame</option>
              <option>Standing</option>
              <option>Vasquez - Beggs</option>
            </SelectField>
          </div>
        </InputRow>
        <InputRow label="Factor volumétrico Bo (rb/stb)">
          <SelectField widthPx={180} fontSizePx={12} defaultValue="Valko - McCain - Spivey">
            <option>Valko - McCain - Spivey</option>
            <option>Standing</option>
          </SelectField>
        </InputRow>
        <InputRow label="Viscosidad Uo saturado (cp)">
          <SelectField widthPx={180} fontSizePx={12} defaultValue="Beggs - Robinson">
            <option>Beggs - Robinson</option>
            <option>Chew - Connally</option>
          </SelectField>
        </InputRow>
        <InputRow label="Viscosidad Uo subsaturado (cp)">
          <SelectField widthPx={180} fontSizePx={12} defaultValue="Petrosky - Farshad">
            <option>Petrosky - Farshad</option>
            <option>Vasquez - Beggs</option>
          </SelectField>
        </InputRow>
        <InputRow label="Viscosidad Uo muerto (cp)">
          <SelectField widthPx={180} fontSizePx={12} defaultValue="RODA V80-120">
            <option>RODA V80-120</option>
            <option>Beal</option>
            <option>Glaso</option>
          </SelectField>
        </InputRow>
        <InputRow label="Agua, Bw (rb/stb), Uw (cp)">
          <SelectField widthPx={180} fontSizePx={12} defaultValue="McCain">
            <option>McCain</option>
            <option>Meehan</option>
          </SelectField>
        </InputRow>
        <InputRow label="Viscosidad del gas, Ug (cp)">
          <SelectField widthPx={180} fontSizePx={12} defaultValue="Lee">
            <option>Lee</option>
            <option>Carr - Kobayashi</option>
          </SelectField>
        </InputRow>
        <InputRow label="Factor de compresibilidad, Z">
          <SelectField widthPx={180} fontSizePx={12} defaultValue="Abou - Kassem">
            <option>Abou - Kassem</option>
            <option>Hall - Yarborough</option>
          </SelectField>
        </InputRow>
        <InputRow label="Tensión superficial agua (dina/cm)">
          <SelectField widthPx={180} fontSizePx={12} defaultValue="Jennings - Newman">
            <option>Jennings - Newman</option>
          </SelectField>
        </InputRow>
        <InputRow label="Tensión superficial petróleo (dina/cm)">
          <SelectField widthPx={180} fontSizePx={12} defaultValue="Abdul - Majeed">
            <option>Abdul - Majeed</option>
            <option>Baker - Swerdloff</option>
          </SelectField>
        </InputRow>
      </GroupCard>
    </div>
  );
};
