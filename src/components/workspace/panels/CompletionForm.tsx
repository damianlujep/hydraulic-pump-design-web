"use client";

import { GroupCard } from "../atoms/GroupCard";
import { InputRow } from "../atoms/InputRow";
import { UnitField } from "../atoms/UnitField";
import { CasingTubingBuilder } from "../casing-tubing/CasingTubingBuilder";
import { useWorkspace } from "../state/WorkspaceContext";
import { registerNumeric } from "../state/numericInput";

export const CompletionForm = () => {
  const {
    forms: { completion },
  } = useWorkspace();
  const { errors, touchedFields } = completion.formState;

  // Compute each field's error message once and derive both the row label and the input's red
  // border from that single value — deriving them from two separate `errors`/`touchedFields`
  // proxy accesses risks the two consumers observing different snapshots under React Compiler's
  // memoization (RHF's formState is a Proxy, which the compiler can't always track reliably).
  const lengthOfShotsError = touchedFields.lengthOfShots ? errors.lengthOfShots?.message : undefined;
  const averageShotDepthError = touchedFields.averageShotDepth ? errors.averageShotDepth?.message : undefined;
  const pumpSettlementLengthError = touchedFields.pumpSettlementLength ? errors.pumpSettlementLength?.message : undefined;
  const pumpSettlementDepthError = touchedFields.pumpSettlementDepth ? errors.pumpSettlementDepth?.message : undefined;

  return (
    <div className="flex flex-col gap-[14px]">
      <GroupCard title="Completación de bombeo hidráulico">
        <InputRow label="Longitud a profundidad media de disparos, MD" error={lengthOfShotsError}>
          <UnitField unit="ft" placeholder="—" error={!!lengthOfShotsError} {...registerNumeric(completion, "lengthOfShots")} />
        </InputRow>
        <InputRow label="Profundidad media de disparos, TVD" error={averageShotDepthError}>
          <UnitField unit="ft" placeholder="—" error={!!averageShotDepthError} {...registerNumeric(completion, "averageShotDepth")} />
        </InputRow>
        <InputRow label="Longitud de asentamiento de bomba, MD" error={pumpSettlementLengthError}>
          <UnitField unit="ft" placeholder="—" error={!!pumpSettlementLengthError} {...registerNumeric(completion, "pumpSettlementLength")} />
        </InputRow>
        <InputRow label="Profundidad de asentamiento de bomba, TVD" error={pumpSettlementDepthError}>
          <UnitField unit="ft" placeholder="—" error={!!pumpSettlementDepthError} {...registerNumeric(completion, "pumpSettlementDepth")} />
        </InputRow>
      </GroupCard>

      <CasingTubingBuilder kind="casing" title="Revestimiento (Casing)" />
      <CasingTubingBuilder kind="tubing" title="Tubería de producción (Tubing)" />
    </div>
  );
};
