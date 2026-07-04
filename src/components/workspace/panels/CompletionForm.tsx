import { GroupCard } from "../GroupCard";
import { InputRow } from "../InputRow";
import { UnitField } from "../UnitField";
import { CasingTubingBuilder } from "../CasingTubingBuilder";

export function CompletionForm() {
  return (
    <div className="flex flex-col gap-[14px]">
      <GroupCard title="Completación de bombeo hidráulico">
        <InputRow
          label="Longitud a profundidad media de disparos, MD"
          error="Campo requerido — ingrese la profundidad MD"
        >
          <UnitField unit="ft" placeholder="—" defaultValue="" error aria-invalid="true" />
        </InputRow>
        <InputRow label="Profundidad media de disparos, TVD">
          <UnitField unit="ft" defaultValue="6103.0" />
        </InputRow>
        <InputRow label="Longitud de asentamiento de bomba, MD">
          <UnitField unit="ft" defaultValue="8511" />
        </InputRow>
        <InputRow label="Profundidad de asentamiento de bomba, TVD">
          <UnitField unit="ft" defaultValue="5957" />
        </InputRow>
      </GroupCard>

      <CasingTubingBuilder kind="casing" title="Revestimiento (Casing)" />
      <CasingTubingBuilder kind="tubing" title="Tubería de producción (Tubing)" />
    </div>
  );
}
