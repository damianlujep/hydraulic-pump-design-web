"use client";

import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createInitialState, workspaceReducer, type WorkspaceAction, type WorkspaceState } from "./reducer";
import { completionSchema, fluidsSchema, iprSchema, type CompletionFormValues, type FluidsFormValues, type IprFormValues } from "./schemas";
import { buildIprRequest, computeIprFingerprint, fromCompletionDto, fromFluidsDto, fromIprDto, fromSurveyDto, toDesignDataDto } from "./designData";
import { useEditLock } from "./useEditLock";
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
  const hydratedFluids = fromFluidsDto(project.designData?.fluids?.data);
  const hydratedIpr = fromIprDto(project.designData?.ipr?.data);
  // Trust a stored result on reload — the fingerprint is seeded from the hydrated form values
  // themselves, so any edit after this point still reverts the step pill via the usual mechanism.
  const hydratedIprResult = project.designData?.ipr?.data?.lastResult ?? null;
  const hydratedIprFingerprint = hydratedIprResult
    ? computeIprFingerprint({ ipr: hydratedIpr, fluids: hydratedFluids })
    : null;

  const [state, dispatch] = useReducer(
    workspaceReducer,
    {
      project,
      casing: hydrated.casing,
      tubing: hydrated.tubing,
      survey,
      iprResult: hydratedIprResult,
      iprFingerprint: hydratedIprFingerprint,
    },
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
    defaultValues: hydratedFluids,
  });
  const iprForm = useForm<IprFormValues>({
    resolver: zodResolver(iprSchema),
    mode: "onTouched",
    defaultValues: hydratedIpr,
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
    const payload = toDesignDataDto({
      completion: completionForm.getValues(),
      fluids: fluidsForm.getValues(),
      ipr: iprForm.getValues(),
      casingSections: state.casing,
      tubingSections: state.tubing,
      survey: state.survey,
      casings,
      tubings,
      newProjectInfo: state.newProjectInfo,
      iprResult: state.iprResult,
      stepDone,
    });
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
        const payload = toDesignDataDto({
          completion: completionForm.getValues(),
          fluids: fluidsForm.getValues(),
          ipr: iprForm.getValues(),
          casingSections: state.casing,
          tubingSections: state.tubing,
          survey: state.survey,
          casings,
          tubings,
          newProjectInfo: state.newProjectInfo,
          iprResult: state.iprResult,
          stepDone,
        });
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

  // Mark the reducer dirty whenever any persistable form's fields change.
  useEffect(() => {
    const completionSub = completionForm.watch(() => dispatch({ type: "MARK_DIRTY" }));
    const fluidsSub = fluidsForm.watch(() => dispatch({ type: "MARK_DIRTY" }));
    const iprSub = iprForm.watch(() => dispatch({ type: "MARK_DIRTY" }));
    return () => {
      completionSub.unsubscribe();
      fluidsSub.unsubscribe();
      iprSub.unsubscribe();
    };
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
