"use client";

import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createInitialState, workspaceReducer, type WorkspaceAction, type WorkspaceState } from "./reducer";
import { completionSchema, fluidsSchema, iprSchema, type CompletionFormValues, type FluidsFormValues, type IprFormValues } from "./schemas";
import { buildIprRequest, computeIprFingerprint, fromCompletionDto, fromFluidsDto, fromIprDto, fromSurveyDto, toDesignDataDto } from "./designData";
import { translateIprDomainError } from "./iprErrorMessages";
import { useEditLock } from "./useEditLock";
import { useSaveDesignData, useUpdateProjectMetadata, type ProjectResponse } from "@/lib/api/projects";
import { useCalculateIpr } from "@/lib/api/calculations";
import type { TubularItem } from "@/lib/api/casings";
import { isErrorResponse } from "@/lib/api/errors";
import type { IprCalcOutcome, IprCalcParams, LockView, StepDoneMap } from "@/interfaces/workspace";
import { toNewProjectInfoDto, type ProjectInfoFormValues } from "@/lib/validation/projectInfo";

type WorkspaceContextValue = {
  state: WorkspaceState;
  dispatch: React.Dispatch<WorkspaceAction>;
  runCalc: (params: IprCalcParams) => Promise<IprCalcOutcome>;
  iprStale: boolean;
  canEdit: boolean;
  lock: LockView;
  retryLock: () => void;
  stepDone: StepDoneMap;
  calcUnlocked: boolean;
  casings: TubularItem[];
  tubings: TubularItem[];
  projectName: string;
  visibility: ProjectResponse["visibility"];
  isOwner: boolean;
  saveProjectInfo: (input: ProjectInfoFormValues) => Promise<void>;
  savingProjectInfo: boolean;
  forms: {
    completion: UseFormReturn<CompletionFormValues>;
    fluids: UseFormReturn<FluidsFormValues>;
    ipr: UseFormReturn<IprFormValues>;
  };
  // Plain watched values, computed once here (the form's owner) — consumers should read these
  // instead of calling `.watch()`/`.getValues()` themselves. Those are non-reactive/opaque calls
  // to React Compiler; a component that only received `forms` via context can have its render
  // memoized and never re-invoke them, showing permanently stale data (see CLAUDE.md).
  iprValues: IprFormValues;
  fluidsValues: FluidsFormValues;
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
  // Documented quirk: extraTestPoints/desiredOilRate are session-ephemeral (no IprDto field), so a
  // persisted FETKOVICH result always hydrates as if calculated with only its point-1 scalars and
  // no design rate — it will NOT show as stale even though the points that produced it are gone.
  const hydratedIprResult = project.designData?.ipr?.data?.lastResult ?? null;
  const hydratedIprFingerprint = hydratedIprResult
    ? computeIprFingerprint({ ipr: hydratedIpr, fluids: hydratedFluids, extraTestPoints: [], desiredOilRate: "" })
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
  const currentFingerprint = computeIprFingerprint({
    ipr: iprWatched,
    fluids: fluidsWatched,
    extraTestPoints: state.iprExtraTestPoints,
    desiredOilRate: state.iprDesiredOilRate,
  });
  const iprStale = state.iprResult !== null && state.iprFingerprint !== currentFingerprint;
  const iprDone = iprForm.formState.isValid && state.iprResult !== null && !iprStale;

  const stepDone: StepDoneMap = { completion: completionDone, fluids: fluidsDone, ipr: iprDone };
  const calcUnlocked = completionDone && fluidsDone && iprDone;

  // --- Autosave: debounced with a max-wait checkpoint, serialized (never two concurrent PUTs),
  // skipped when the payload didn't actually change since the last successful save. ---
  const saveDesignData = useSaveDesignData(projectId);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const pendingRef = useRef(false);

  const buildCurrentPayload = () =>
    toDesignDataDto({
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

  const lastSavedPayloadRef = useRef<string | null>(null);
  // Lazy-init on first render only, seeded with the hydrated payload (not null) so a no-op revision
  // bump before the first real save (e.g. a rejected keystroke, or toggling the non-persisted
  // correlation select) dedupes into SAVE_NOOP instead of firing a real PUT of unchanged data.
  if (lastSavedPayloadRef.current === null) {
    lastSavedPayloadRef.current = JSON.stringify(buildCurrentPayload());
  }
  const inFlightSaveRef = useRef<Promise<unknown> | null>(null);

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
    const payload = buildCurrentPayload();
    const serialized = JSON.stringify(payload);
    if (serialized === lastSavedPayloadRef.current) {
      // Nothing to persist (e.g. only the ephemeral correlation select changed), but revision was
      // still bumped by MARK_DIRTY — without this, saveStatus would be stuck at "dirty" forever
      // since no SAVE_STARTED/SAVE_SUCCESS cycle runs to clear it.
      dispatch({ type: "SAVE_NOOP", revision: revisionAtSave });
      return;
    }

    savingRef.current = true;
    dispatch({ type: "SAVE_STARTED" });
    const settled = saveDesignData
      .mutateAsync({ designData: payload, version: state.version })
      .then((fresh) => {
        savingRef.current = false;
        lastSavedPayloadRef.current = serialized;
        dispatch({ type: "SAVE_SUCCESS", version: fresh.version ?? state.version, revision: revisionAtSave });
        if (pendingRef.current) {
          pendingRef.current = false;
          flushSave();
        }
      })
      .catch((err: unknown) => {
        savingRef.current = false;
        if (isErrorResponse(err) && err.code === "VERSION_CONFLICT") {
          dispatch({ type: "SAVE_CONFLICT" });
        } else {
          dispatch({ type: "SAVE_ERROR" });
          toast.error("No se pudo guardar los cambios");
        }
      })
      .finally(() => {
        if (inFlightSaveRef.current === settled) inFlightSaveRef.current = null;
      });
    inFlightSaveRef.current = settled;
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
        const payload = buildCurrentPayload();
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

  // --- IPR calculation (Vogel + Fetkovich, via the pre-flight IprCalcModal) ---
  const calculateIpr = useCalculateIpr();
  const calcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Validation of calc-relevant inputs lives in buildIprRequest/validateIprCalcInputs — this no
  // longer gates on the whole IPR form (cards B/D feed a future pump-design calc, not this one).
  // `params` is passed explicitly (not read from `state`) because the modal commits
  // SET_IPR_CALC_PARAMS just before calling this, and a dispatch doesn't apply synchronously.
  const runCalc = async (params: IprCalcParams): Promise<IprCalcOutcome> => {
    if (!canEdit || state.calcStatus === "running") return { ok: false, message: "" };
    const built = buildIprRequest(iprForm.getValues(), fluidsForm.getValues(), params);
    if ("error" in built) return { ok: false, message: built.error.message };

    dispatch({ type: "CALC_RUNNING" });
    try {
      const result = await calculateIpr.mutateAsync(built.request);
      dispatch({ type: "CALC_SUCCESS", result, fingerprint: built.fingerprint });
      if (calcTimer.current) clearTimeout(calcTimer.current);
      calcTimer.current = setTimeout(() => dispatch({ type: "CALC_IDLE" }), 2500);
      return { ok: true };
    } catch (err: unknown) {
      dispatch({ type: "CALC_ERROR" });
      return { ok: false, message: isErrorResponse(err) ? translateIprDomainError(err.message) : "Error en el cálculo IPR" };
    }
  };

  const updateMetadata = useUpdateProjectMetadata(projectId);
  const saveProjectInfo = async (input: ProjectInfoFormValues) => {
    const metadataChanged = input.name !== projectName || input.visibility !== project.visibility;
    if (metadataChanged) {
      if (inFlightSaveRef.current) await inFlightSaveRef.current;
      savingRef.current = true;
      try {
        const fresh = await updateMetadata.mutateAsync({ name: input.name, visibility: input.visibility });
        dispatch({ type: "METADATA_SAVED", version: fresh.version ?? state.version });
      } finally {
        savingRef.current = false;
      }
    }
    const nextInfo = toNewProjectInfoDto(input.name, input);
    if (JSON.stringify(nextInfo) !== JSON.stringify(state.newProjectInfo?.data)) {
      dispatch({ type: "SET_PROJECT_INFO", data: nextInfo });
    }
  };

  const projectName = project.name ?? "";
  const isOwner = project.myPermission === "OWNER";

  return (
    <WorkspaceContext.Provider
      value={{
        state,
        dispatch,
        runCalc,
        iprStale,
        canEdit,
        lock,
        retryLock,
        stepDone,
        calcUnlocked,
        casings,
        tubings,
        projectName,
        visibility: project.visibility,
        isOwner,
        saveProjectInfo,
        savingProjectInfo: updateMetadata.isPending,
        forms: { completion: completionForm, fluids: fluidsForm, ipr: iprForm },
        iprValues: iprWatched,
        fluidsValues: fluidsWatched,
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
