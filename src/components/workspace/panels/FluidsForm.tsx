import { LockIcon } from "@/components/icons";
import { GroupCard } from "../GroupCard";
import { InputRow } from "../InputRow";
import { UnitField } from "../UnitField";
import { SelectField } from "../SelectField";

const PLAIN_NUMBER_CLASS =
  "w-[150px] p-[5px_9px] font-mono text-[13px] font-medium text-left bg-surface-3 border border-border rounded-[6px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]";

export const FluidsForm = () => {
  return (
    <div className="flex flex-col gap-[14px]">
      <GroupCard title="Fluido motriz inyectado">
        <InputRow label="Fluido motriz inyectado">
          <SelectField defaultValue="Petróleo">
            <option>Petróleo</option>
            <option>Agua</option>
          </SelectField>
        </InputRow>
        <InputRow label="Gravedad del petróleo inyectado">
          <UnitField unit="°API" defaultValue="10" />
        </InputRow>
      </GroupCard>

      <GroupCard title="Fluido producido">
        <InputRow label="Presión de separador">
          <UnitField unit="psi" defaultValue="170" />
        </InputRow>
        <InputRow label="Temperatura de separador">
          <UnitField unit="°F" defaultValue="150" />
        </InputRow>
        <InputRow label="Relación gas-petróleo, GOR">
          <UnitField unit="scf/stb" defaultValue="57" />
        </InputRow>
        <InputRow label="Gravedad del petróleo">
          <UnitField unit="°API" defaultValue="18" />
        </InputRow>
        <InputRow label="Gravedad específica del gas, SGg">
          <input defaultValue="0.81" className={PLAIN_NUMBER_CLASS} />
        </InputRow>
        <InputRow label="Salinidad del agua de formación">
          <UnitField unit="ppm Cl⁻" defaultValue="6200" />
        </InputRow>
        <InputRow label="Grav. específica, agua inyectada, SGw">
          <input defaultValue="1.004" className={PLAIN_NUMBER_CLASS} />
        </InputRow>
        <InputRow label="Corte de agua producida, BSW">
          <UnitField unit="fracción" defaultValue="0.342" />
        </InputRow>
      </GroupCard>

      <GroupCard title="Correlaciones PVT">
        <InputRow label="Presión de burbuja, Pb">
          <span className="inline-flex items-stretch flex-none w-[180px]">
            <input
              defaultValue="520"
              className="flex-1 min-w-0 p-[5px_9px] font-mono text-[13px] font-medium text-left bg-surface-3 border border-border border-r-0 rounded-l-[6px] text-text outline-none focus:border-primary focus:shadow-[0_0_0_2px_var(--primary-ring)]"
            />
            <span className="inline-flex items-center px-[9px] text-[10.5px] font-mono text-text-faint bg-surface-2 border border-border rounded-r-[6px] whitespace-nowrap">
              psi
            </span>
          </span>
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
