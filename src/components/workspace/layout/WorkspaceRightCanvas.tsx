"use client";

import { EmptyPanel } from "../atoms/EmptyPanel";
import { SurveyTable } from "../canvas/SurveyTable";
import { TrajectoryChart } from "../canvas/TrajectoryChart";
import { IprChart } from "../canvas/IprChart";
import { PvtChart } from "../canvas/PvtChart";
import { ChartStats } from "../canvas/ChartStats";
import { useWorkspace } from "../state/WorkspaceContext";

export const WorkspaceRightCanvas = () => {
  const { state, dispatch, iprStale, stepDone, forms, iprValues, fluidsValues } = useWorkspace();

  if (state.activeTab === "completion") {
    if (state.survey.length > 0) {
      return (
        <>
          <SurveyTable />
          <div className="bg-surface border border-border rounded-card p-[14px_16px_12px]">
            <div className="text-[13px] font-bold tracking-[-.01em] mb-2">Trayectoria y Desviación del Pozo</div>
            <TrajectoryChart rows={state.survey} />
          </div>
        </>
      );
    }
    return (
      <div className="flex flex-col gap-4 my-auto">
        <div className="bg-surface border border-border rounded-card p-[14px_16px_12px]">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-[13px] font-bold tracking-[-.01em]">Survey Direccional</div>
            <button
              onClick={() => dispatch({ type: "OPEN_SURVEY_MODAL" })}
              className="inline-flex items-center gap-[7px] px-[13px] py-[7px] rounded-[9px] bg-primary border-none text-primary-fg text-xs font-semibold cursor-pointer shadow-[0_4px_12px_var(--primary-ring)] hover:bg-primary-hover"
            >
              Editar survey direccional
            </button>
          </div>
          <EmptyPanel
            title="Sin survey direccional cargado"
            message="Importe o inserte las estaciones de survey para visualizar la tabla y calcular TVD por interpolación."
            cta="Insertar datos de survey"
            onCta={() => dispatch({ type: "OPEN_SURVEY_MODAL" })}
          />
        </div>
        <div className="bg-surface border border-border rounded-card p-[14px_16px_12px]">
          <div className="text-[13px] font-bold tracking-[-.01em] mb-2">Trayectoria y Desviación del Pozo</div>
          <EmptyPanel
            title="Sin trayectoria para graficar"
            message="Complete el survey direccional para generar el perfil de trayectoria y desviación del pozo."
            cta="Editar datos de trayectoria"
            onCta={() => dispatch({ type: "OPEN_SURVEY_MODAL" })}
          />
        </div>
      </div>
    );
  }

  if (state.activeTab === "ipr") {
    const result = state.iprResult;
    const stats = result
      ? [
          { label: "Ps", value: iprValues.reservoirPressure, unit: "psi", color: "var(--data-orange)" },
          { label: "Pwf", value: iprValues.flowingBottomholePressure, unit: "psi" },
          { label: "Pb", value: fluidsValues.bubblePointPressure, unit: "psi", color: "var(--danger)" },
          { label: "Qmáx", value: (result.absoluteOpenFlow ?? 0).toFixed(0), unit: "bfpd" },
          { label: "PI (J)", value: (result.productivityIndex ?? 0).toFixed(2), unit: "bfpd/psi" },
          ...(result.correlation === "FETKOVICH" && result.fetkovichExponent != null
            ? [{ label: "n", value: result.fetkovichExponent.toFixed(3), unit: "" }]
            : []),
          ...(result.designPoint
            ? [
                {
                  label: "Pwf diseño",
                  value: (result.designPoint.requiredFlowingBottomholePressure ?? 0).toFixed(0),
                  unit: "psi",
                  color: "var(--amber)",
                },
                { label: "Q diseño", value: (result.designPoint.totalFlowRate ?? 0).toFixed(0), unit: "bfpd" },
                { label: "Qo diseño", value: (result.designPoint.oilFlowRate ?? 0).toFixed(0), unit: "STB/d" },
              ]
            : []),
        ]
      : [];

    return (
      <div className="bg-surface border border-border rounded-card p-[14px_16px_12px] my-auto">
        <div className="flex items-center gap-[10px] mb-2">
          <div className="text-[13px] font-bold tracking-[-.01em]">
            Curva de Rendimiento IPR
            {result && ` — ${result.correlation === "FETKOVICH" ? "Fetkovich" : "Vogel"}`}
          </div>
          {iprStale && result && (
            <span className="px-[8px] py-[2px] rounded-full bg-amber-soft text-amber text-[10.5px] font-semibold">
              Resultado desactualizado
            </span>
          )}
        </div>
        {result ? (
          <>
            <IprChart
              result={result}
              reservoirPressure={Number(iprValues.reservoirPressure)}
              bubblePointPressure={Number(fluidsValues.bubblePointPressure)}
            />
            <ChartStats stats={stats} />
          </>
        ) : (
          <EmptyPanel
            title="Sin curva IPR generada"
            message="Ingrese los parámetros del yacimiento y ejecute el cálculo para obtener la curva de rendimiento."
            cta="Ejecutar cálculo IPR"
            onCta={() => dispatch({ type: "OPEN_IPR_CALC_MODAL" })}
          />
        )}
      </div>
    );
  }

  if (state.activeTab === "fluids") {
    return (
      <div className="bg-surface border border-border rounded-card p-[14px_16px_12px] my-auto">
        <div className="flex items-center gap-[10px] mb-2">
          <div className="text-[13px] font-bold tracking-[-.01em]">Propiedades PVT vs Presión</div>
          <span className="text-[11px] text-text-faint font-mono">aceite negro</span>
        </div>
        {stepDone.fluids ? (
          <>
            <PvtChart />
            <ChartStats
              stats={[
                { label: "Pb", value: "520", unit: "psi", color: "var(--danger)" },
                { label: "Bo @ Pb", value: "1.284", unit: "rb/stb", color: "var(--data-blue)" },
                { label: "Rs @ Pb", value: "385", unit: "scf/stb", color: "var(--data-orange)" },
                { label: "μo @ Pb", value: "1.92", unit: "cp", color: "var(--data-green)" },
                { label: "API", value: "32.4", unit: "°" },
              ]}
            />
          </>
        ) : (
          <EmptyPanel
            title="Sin propiedades PVT calculadas"
            message="Complete todos los campos de fluidos y PVT para generar las curvas Bo, Rs y μo vs presión."
            cta="Ver campos pendientes"
            onCta={() => void forms.fluids.trigger()}
          />
        )}
      </div>
    );
  }

  return null;
};
