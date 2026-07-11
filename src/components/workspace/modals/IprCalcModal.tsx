"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { AlertCircleIcon, CheckIcon, PlusIcon, SpinnerIcon, XIcon } from "@/components/icons";
import { useWorkspace } from "../state/WorkspaceContext";
import { UnitField } from "../atoms/UnitField";
import { SelectField } from "../atoms/SelectField";
import { sanitizeNumeric } from "../state/numericInput";
import { validateIprCalcInputs } from "../state/designData";
import { RESERVOIR_MODEL_OPTIONS } from "../state/correlations";
import { useModalOpenReset } from "../state/useModalOpenReset";
import type { IprFormValues } from "../state/schemas";
import type { TestPointDraft } from "@/interfaces/workspace";

const MAX_TEST_POINTS = 10;
const EMPTY_POINT: TestPointDraft = { flowRate: "", flowingBottomholePressure: "" };
const nonEmptyRow = (r: TestPointDraft) => r.flowRate.trim() !== "" || r.flowingBottomholePressure.trim() !== "";

// Missing chips are a button, not just a badge — clicking one closes the modal and jumps to the
// tab that owns the field, rather than editing it inline here (editing Fluidos from a calc modal
// risks changing unrelated data the user didn't come here to touch).
const Chip = ({
  label,
  value,
  unit,
  missingHint,
  onGoTo,
}: {
  label: string;
  value: string;
  unit: string;
  missingHint: string;
  onGoTo: () => void;
}) => {
  const missing = value.trim() === "";
  if (missing) {
    return (
      <button
        type="button"
        onClick={onGoTo}
        className="flex items-center gap-[7px] px-3 py-[7px] rounded-[8px] border border-amber bg-amber-soft text-amber text-[11.5px] cursor-pointer hover:opacity-80"
      >
        <span className="font-semibold text-text">{label}</span>
        <span className="inline-flex items-center gap-[4px]">
          <AlertCircleIcon size={12} />
          Falta — ir a completar en {missingHint}
        </span>
      </button>
    );
  }
  return (
    <div className="flex items-center gap-[7px] px-3 py-[7px] rounded-[8px] border border-border bg-surface-2 text-text-dim text-[11.5px]">
      <span className="font-semibold text-text">{label}</span>
      <span className="font-mono text-text">
        {value}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
};

export const IprCalcModal = () => {
  const { state, dispatch, canEdit, forms, runCalc, iprValues, fluidsValues } = useWorkspace();
  const { ipr } = forms;

  const [rows, setRows] = useState<TestPointDraft[]>([EMPTY_POINT]);
  const [desiredOilRate, setDesiredOilRate] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  useModalOpenReset(state.iprCalcModalOpen, () => {
    const v = ipr.getValues();
    setRows([{ flowRate: v.testFlowRate, flowingBottomholePressure: v.flowingBottomholePressure }, ...state.iprExtraTestPoints]);
    setDesiredOilRate(state.iprDesiredOilRate);
    setServerError(null);
  });

  if (!state.iprCalcModalOpen) return null;

  const correlation = iprValues.correlation;
  const running = state.calcStatus === "running";
  // Row 1 is always test point 1 (mirrors the persisted card-A Pwf/testFlowRate fields); under
  // FETKOVICH the table pads to 2 rows at render time so the minimum is visible without an
  // add-row click, but nothing is materialized into `rows` until an actual edit or "Agregar
  // punto" — this must stay a read-only derivation, not a second setRows(...) in this render:
  // useModalOpenReset above already calls setRows once to seed row 1, and React applies same-state
  // setState calls within one render pass in order (last write wins, they don't merge), so a
  // second unconditional setRows here would silently clobber that seed.
  const displayRows = correlation === "FETKOVICH" && rows.length < 2 ? [...rows, { ...EMPTY_POINT }] : rows;

  const setCorrelation = (value: IprFormValues["correlation"]) => {
    ipr.setValue("correlation", value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setServerError(null);
  };

  const setRow = (i: number, field: keyof TestPointDraft, value: string) => {
    const next = displayRows.slice();
    next[i] = { ...next[i], [field]: sanitizeNumeric(value) };
    setRows(next);
    setServerError(null);
  };

  const addRow = () => {
    if (displayRows.length >= MAX_TEST_POINTS) return;
    setRows([...displayRows, { ...EMPTY_POINT }]);
    setServerError(null);
  };
  const removeRow = (i: number) => {
    if (displayRows.length <= 2) return;
    setRows(displayRows.filter((_, idx) => idx !== i));
    setServerError(null);
  };

  const point1 = displayRows[0];
  const extraTestPoints = displayRows.slice(1).filter(nonEmptyRow);
  const calcParams = { point1, extraTestPoints, desiredOilRate };
  const validation = validateIprCalcInputs(iprValues, fluidsValues, calcParams);
  const canCalc = canEdit && !running && validation.ok;

  const commitParams = () => dispatch({ type: "SET_IPR_CALC_PARAMS", extraTestPoints, desiredOilRate });

  const handleCancel = () => {
    if (running) return;
    commitParams();
    dispatch({ type: "CLOSE_IPR_CALC_MODAL" });
  };

  const goToField = (tab: "ipr" | "fluids") => {
    if (running) return;
    commitParams();
    dispatch({ type: "CLOSE_IPR_CALC_MODAL" });
    dispatch({ type: "SET_TAB", tab });
  };

  const handleCalc = async () => {
    if (!canCalc) return;
    ipr.setValue("testFlowRate", point1.flowRate, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    ipr.setValue("flowingBottomholePressure", point1.flowingBottomholePressure, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    // Commit before running so CALC_SUCCESS's fingerprint (computed from reducer state) matches
    // what was actually sent — dispatch doesn't apply synchronously, so runCalc takes params
    // explicitly rather than reading state.iprExtraTestPoints in the same tick.
    commitParams();
    const outcome = await runCalc(calcParams);
    if (outcome.ok) dispatch({ type: "CLOSE_IPR_CALC_MODAL" });
    else setServerError(outcome.message);
  };

  return (
    <Modal onClose={running ? undefined : handleCancel} maxWidthPx={640} zIndex={60} scroll="outer">
      <div className="flex items-start justify-between gap-4 p-[20px_24px_16px] border-b border-border">
        <div>
          <h2 className="m-0 text-lg font-bold tracking-[-.01em]">Cálculo IPR</h2>
          <p className="mt-[5px] text-[12.5px] text-text-dim">Modelo de reservorio, puntos de prueba y punto de diseño</p>
        </div>
        <button
          onClick={handleCancel}
          disabled={running}
          className="w-8 h-8 rounded-lg bg-surface-2 border border-border text-text-dim cursor-pointer flex items-center justify-center flex-none hover:text-text hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XIcon size={16} />
        </button>
      </div>

      <div className="p-[20px_24px] flex flex-col gap-[16px]">
        <div className="flex flex-wrap gap-[8px]">
          <Chip
            label="Presión estática del reservorio, Ps"
            value={iprValues.reservoirPressure}
            unit="psi"
            missingHint="IPR"
            onGoTo={() => goToField("ipr")}
          />
          <Chip
            label="Presión de burbuja, Pb"
            value={fluidsValues.bubblePointPressure}
            unit="psi"
            missingHint="Fluidos y PVT"
            onGoTo={() => goToField("fluids")}
          />
          <Chip
            label="Corte de agua, BSW"
            value={fluidsValues.waterCut}
            unit=""
            missingHint="Fluidos y PVT"
            onGoTo={() => goToField("fluids")}
          />
        </div>

        <label className="flex flex-col gap-[6px]">
          <span className="text-[11.5px] font-semibold text-text-dim">Modelo de reservorio para IPR</span>
          <SelectField
            widthPx={180}
            disabled={!canEdit}
            value={correlation}
            onChange={(e) => setCorrelation(e.target.value as IprFormValues["correlation"])}
          >
            {RESERVOIR_MODEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectField>
        </label>

        <div className="flex flex-col gap-[6px]">
          <span className="text-[11.5px] font-semibold text-text-dim">Puntos de prueba</span>
          {displayRows.map((row, i) => {
            if (i > 0 && correlation !== "FETKOVICH") return null;
            return (
              <div key={i} className="flex items-center gap-[10px] p-[6px_10px] rounded-[7px] hover:bg-surface-2">
                <span className="w-[62px] flex-none text-[12px] text-text-dim">Punto {i + 1}</span>
                <UnitField
                  unit="bfpd"
                  widthPx={120}
                  placeholder="—"
                  disabled={!canEdit}
                  value={row.flowRate}
                  onChange={(e) => setRow(i, "flowRate", e.target.value)}
                />
                <UnitField
                  unit="psi"
                  widthPx={120}
                  placeholder="—"
                  disabled={!canEdit}
                  value={row.flowingBottomholePressure}
                  onChange={(e) => setRow(i, "flowingBottomholePressure", e.target.value)}
                />
                {correlation === "FETKOVICH" && i > 0 && displayRows.length > 2 && canEdit && (
                  <button
                    onClick={() => removeRow(i)}
                    className="inline-flex p-1 rounded-[6px] bg-transparent border-none text-text-faint cursor-pointer hover:text-danger hover:bg-danger-soft"
                  >
                    <XIcon size={12} strokeWidth={2.2} />
                  </button>
                )}
              </div>
            );
          })}
          {correlation === "FETKOVICH" && canEdit && (
            <div className="flex items-center gap-3 mt-[4px]">
              <button
                onClick={addRow}
                disabled={displayRows.length >= MAX_TEST_POINTS}
                className="inline-flex items-center gap-[5px] px-3 py-[6px] rounded-[8px] bg-surface-2 border border-dashed border-border-strong text-text-dim text-[11.5px] font-semibold cursor-pointer hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlusIcon size={12} strokeWidth={2.2} />
                Agregar punto
              </button>
              <span className="text-[11px] text-text-faint font-mono">
                {displayRows.length}/{MAX_TEST_POINTS} puntos
              </span>
            </div>
          )}
        </div>

        <label className="flex flex-col gap-[6px]">
          <span className="text-[11.5px] font-semibold text-text-dim">Tasa deseada de petróleo (opcional)</span>
          <UnitField
            unit="STB/d"
            widthPx={160}
            placeholder="—"
            disabled={!canEdit}
            value={desiredOilRate}
            onChange={(e) => {
              setDesiredOilRate(sanitizeNumeric(e.target.value));
              setServerError(null);
            }}
          />
          <span className="text-[11px] text-text-faint">Opcional — punto de diseño para bomba jet</span>
        </label>

        {serverError ? (
          <div className="p-[10px_12px] rounded-[8px] bg-danger-soft text-[12px] text-danger">
            El servidor rechazó el cálculo: {serverError}
          </div>
        ) : (
          !validation.ok && (
            <div className="flex items-center gap-[6px] text-[11.5px] text-amber">
              <AlertCircleIcon size={13} />
              {validation.message}
            </div>
          )
        )}

        <div className="flex justify-end gap-[10px] mt-[6px]">
          <button
            onClick={handleCancel}
            disabled={running}
            className="cursor-pointer rounded-[9px] border border-border bg-surface-2 px-4 py-[9px] text-[12.5px] font-semibold text-text hover:border-border-strong disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={() => void handleCalc()}
            disabled={!canCalc}
            className="inline-flex items-center gap-2 cursor-pointer rounded-[9px] bg-primary px-4 py-[9px] text-[12.5px] font-bold text-primary-fg shadow-[0_5px_16px_var(--primary-ring)] hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {running ? (
              <>
                <SpinnerIcon size={15} className="animate-spin-fast" />
                Calculando…
              </>
            ) : (
              <>
                <CheckIcon size={15} />
                Calcular
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
