"use client";

import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createInitialState, workspaceReducer, type WorkspaceAction, type WorkspaceState } from "./reducer";
import { completionSchema, fluidsSchema, iprSchema, type CompletionFormValues, type FluidsFormValues, type IprFormValues } from "./schemas";
import { buildIprRequest, fromCompletionDto, fromSurveyDto, toDesignDataDto } from "./designData";
import { useEditLock } from "./useEditLock";
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
  INJECTED_FLUID_HYDRAULIC_CORRELATION_OPTIONS,
  MULTIPHASE_FLOW_CORRELATION_OPTIONS,
} from "./correlations";
import { useSaveDesignData, type ProjectResponse } from "@/lib/api/projects";
import { useCalculateIpr } from "@/lib/api/calculations";
import type { TubularItem } from "@/lib/api/casings";
import { isErrorResponse } from "@/lib/api/errors";
import type { LockView, StepDoneMap } from "@/interfaces/workspace";

type WorkspaceContextValue = {
  state: WorkspaceState;
  dispatch: React.Dispatch<WorkspaceAction>;
  runCalc: () => void;
  canEdit: boolean;
  lock: LockView;
  retryLock: () => void;
  stepDone: StepDoneMap;
  calcUnlocked: boolean;
  casings: TubularItem[];
  tubings: TubularItem[];
  projectName: string;
  forms: {
    completion: UseFormReturn<CompletionFormValues>;
    fluids: UseFormReturn<FluidsFormValues>;
    ipr: UseFormReturn<IprFormValues>;
  };
  requestReload: () => void;
  dismissConflict: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const AUTOSAVE_DEBOUNCE_MS = 2000;
const AUTOSAVE_MAX_WAIT_MS = 10000;

const EMPTY_FLUIDS: FluidsFormValues = {
  oilGravityInjected: "",
  separatorPressure: "",
  separatorTemperature: "",
  gor: "",
  oilGravity: "",
  sgg: "",
  salinity: "",
  sgw: "",
  waterCut: "",
  bubblePointPressure: "",
  // Correlation/fluid-type selects always start on their current default — unlike the numeric
  // fields above, these aren't user-blank-required.
  injectedFluidType: INJECTED_FLUID_TYPE_OPTIONS[0].value,
  gasSolubilityCorrelation: GAS_SOLUBILITY_CORRELATION_OPTIONS[0].value,
  oilFvfCorrelation: OIL_FVF_CORRELATION_OPTIONS[0].value,
  saturatedOilViscosityCorrelation: SATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS[0].value,
  undersaturatedOilViscosityCorrelation: UNDERSATURATED_OIL_VISCOSITY_CORRELATION_OPTIONS[0].value,
  deadOilViscosityCorrelation: DEAD_OIL_VISCOSITY_CORRELATION_OPTIONS[0].value,
  waterFvfViscosityCorrelation: WATER_FVF_VISCOSITY_CORRELATION_OPTIONS[0].value,
  gasViscosityCorrelation: GAS_VISCOSITY_CORRELATION_OPTIONS[0].value,
  gasCompressibilityCorrelation: GAS_COMPRESSIBILITY_CORRELATION_OPTIONS[0].value,
  waterSurfaceTensionCorrelation: WATER_SURFACE_TENSION_CORRELATION_OPTIONS[0].value,
  oilSurfaceTensionCorrelation: OIL_SURFACE_TENSION_CORRELATION_OPTIONS[0].value,
};
const EMPTY_IPR: IprFormValues = {
  bottomholeTemperature: "",
  wellheadTemperature: "",
  reservoirPressure: "",
  flowingBottomholePressure: "",
  pumpIntakePressure: "",
  testFlowRate: "",
  maxInjectedVolume: "",
  maxInjectionPressure: "",
  jetMaxRatio: "",
  jetMinEfficiency: "",
  pistonMaxRatio: "",
  designFlowRate: "",
  flowingWellheadPressure: "",
  maxRefInjectionRate: "",
  maxInjectionPressureAdjusted: "",
  injectedFluidHydraulicCorrelation: INJECTED_FLUID_HYDRAULIC_CORRELATION_OPTIONS[0].value,
  multiphaseFlowCorrelation: MULTIPHASE_FLOW_CORRELATION_OPTIONS[0].value,
};

type WorkspaceProviderProps = {
  project: ProjectResponse;
  casings: TubularItem[];
  tubings: TubularItem[];
  onReloadRequested: () => void;
  children: React.ReactNode;
};

export const WorkspaceProvider = ({ project, casings, tubings, onReloadRequested, children }: WorkspaceProviderProps) => {
  const projectId = project.id ?? 0;
  const hydrated = fromCompletionDto(project.designData?.completion?.data, casings, tubings);
  const survey = fromSurveyDto(project.designData?.directionalSurvey?.data);

  const [state, dispatch] = useReducer(
    workspaceReducer,
    { project, casing: hydrated.casing, tubing: hydrated.tubing, survey },
    createInitialState,
  );

  const completionForm = useForm<CompletionFormValues>({
    resolver: zodResolver(completionSchema),
    mode: "onTouched",
    defaultValues: hydrated.completion,
  });
  const fluidsForm = useForm<FluidsFormValues>({
    resolver: zodResolver(fluidsSchema),
    mode: "onTouched",
    defaultValues: EMPTY_FLUIDS,
  });
  const iprForm = useForm<IprFormValues>({
    resolver: zodResolver(iprSchema),
    mode: "onTouched",
    defaultValues: EMPTY_IPR,
  });

  // Compute isValid accurately from mount (without a resolver, RHF only knows validity after the
  // user interacts with a field) — errors this populates stay hidden until a field is touched.
  useEffect(() => {
    void completionForm.trigger();
    void fluidsForm.trigger();
    void iprForm.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canEditPermission = project.myPermission === "OWNER" || project.myPermission === "EDITOR";
  const { lock, retry: retryLock } = useEditLock(projectId, canEditPermission);
  const canEdit = canEditPermission && lock.status === "mine";

  const casingComplete = state.casing.every((s) => s.catalogId != null && s.length.trim() !== "");
  const tubingComplete = state.tubing.every((s) => s.catalogId != null && s.length.trim() !== "");
  const completionDone =
    completionForm.formState.isValid && casingComplete && tubingComplete && state.survey.length > 0;
  const fluidsDone = fluidsForm.formState.isValid;

  const iprWatched = iprForm.watch();
  const fluidsWatched = fluidsForm.watch();
  const currentFingerprint = JSON.stringify({ ipr: iprWatched, fluids: fluidsWatched });
  const iprDone = iprForm.formState.isValid && state.iprResult !== null && state.iprFingerprint === currentFingerprint;

  const stepDone: StepDoneMap = { completion: completionDone, fluids: fluidsDone, ipr: iprDone };
  const calcUnlocked = completionDone && fluidsDone && iprDone;

  // --- Autosave: debounced with a max-wait checkpoint, serialized (never two concurrent PUTs),
  // skipped when the payload didn't actually change since the last successful save. ---
  const saveDesignData = useSaveDesignData(projectId);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const pendingRef = useRef(false);
  const lastSavedPayloadRef = useRef<string | null>(null);

  const flushSave = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (maxWaitTimer.current) clearTimeout(maxWaitTimer.current);
    debounceTimer.current = null;
    maxWaitTimer.current = null;

    if (!canEdit) return;
    if (savingRef.current) {
      pendingRef.current = true;
      return;
    }

    const revisionAtSave = state.revision;
    const payload = toDesignDataDto(
      completionForm.getValues(),
      state.casing,
      state.tubing,
      state.survey,
      casings,
      tubings,
      state.newProjectInfo,
      completionDone,
    );
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedPayloadRef.current) return;

    savingRef.current = true;
    dispatch({ type: "SAVE_STARTED" });
    saveDesignData.mutate(
      { designData: payload, version: state.version },
      {
        onSuccess: (fresh) => {
          savingRef.current = false;
          lastSavedPayloadRef.current = serialized;
          dispatch({ type: "SAVE_SUCCESS", version: fresh.version ?? state.version, revision: revisionAtSave });
          if (pendingRef.current) {
            pendingRef.current = false;
            flushSave();
          }
        },
        onError: (err) => {
          savingRef.current = false;
          if (isErrorResponse(err) && err.code === "VERSION_CONFLICT") {
            dispatch({ type: "SAVE_CONFLICT" });
          } else {
            dispatch({ type: "SAVE_ERROR" });
            toast.error("No se pudo guardar los cambios");
          }
        },
      },
    );
  };

  useEffect(() => {
    if (state.revision === 0 || !canEdit) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(flushSave, AUTOSAVE_DEBOUNCE_MS);
    if (!maxWaitTimer.current) {
      maxWaitTimer.current = setTimeout(flushSave, AUTOSAVE_MAX_WAIT_MS);
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.revision, canEdit]);

  useEffect(() => {
    const onPageHide = () => {
      if (state.saveStatus === "dirty" && canEdit && projectId) {
        const payload = toDesignDataDto(
          completionForm.getValues(),
          state.casing,
          state.tubing,
          state.survey,
          casings,
          tubings,
          state.newProjectInfo,
          completionDone,
        );
        void fetch(`/api/projects/${projectId}/design-data`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ designData: payload, version: state.version }),
          keepalive: true,
        });
      }
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.saveStatus, state.version, canEdit, projectId]);

  // Mark the reducer dirty whenever the persisted (completion-step) form fields change.
  useEffect(() => {
    const subscription = completionForm.watch(() => dispatch({ type: "MARK_DIRTY" }));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- IPR calculation (Vogel only) ---
  const calculateIpr = useCalculateIpr();
  const calcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runCalc = () => {
    if (!canEdit || state.calcStatus === "running") return;
    void iprForm.trigger();
    if (!iprForm.formState.isValid) {
      toast.error("Complete Ps, Pwf y tasa de prueba antes de calcular");
      return;
    }
    const built = buildIprRequest(iprForm.getValues(), fluidsForm.getValues());
    if ("fieldError" in built) {
      fluidsForm.setError("bubblePointPressure", { message: built.fieldError.message });
      toast.error(built.fieldError.message);
      return;
    }

    dispatch({ type: "CALC_RUNNING" });
    calculateIpr.mutate(built.request, {
      onSuccess: (result) => {
        dispatch({ type: "CALC_SUCCESS", result, fingerprint: built.fingerprint });
        if (calcTimer.current) clearTimeout(calcTimer.current);
        calcTimer.current = setTimeout(() => dispatch({ type: "CALC_IDLE" }), 2500);
      },
      onError: (err) => {
        dispatch({ type: "CALC_ERROR" });
        toast.error(isErrorResponse(err) ? err.message : "Error en el cálculo IPR");
      },
    });
  };

  const projectName = project.name ?? "";

  return (
    <WorkspaceContext.Provider
      value={{
        state,
        dispatch,
        runCalc,
        canEdit,
        lock,
        retryLock,
        stepDone,
        calcUnlocked,
        casings,
        tubings,
        projectName,
        forms: { completion: completionForm, fluids: fluidsForm, ipr: iprForm },
        requestReload: onReloadRequested,
        dismissConflict: () => dispatch({ type: "DISMISS_CONFLICT" }),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return ctx;
};
