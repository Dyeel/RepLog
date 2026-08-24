import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { buildSchedule, getDefaultAppData } from '@/lib/defaults';
import { EXERCISE_LIBRARY, getExerciseMuscleGroup } from '@/lib/exercise-library';
import { loadAppData, saveAppData } from '@/lib/storage';
import { calculateStats, generateId, toDateKey } from '@/lib/utils';
import {
  ActiveWorkoutSession,
  AppData,
  BodyWeightEntry,
  DayOfWeek,
  ExerciseDefinition,
  FullWorkoutSession,
  MuscleGroup,
  ScheduleDay,
  ThemeId,
  WeightUnit,
  WorkoutExercise,
  WorkoutFrequency,
  WorkoutLog,
  WorkoutSet,
} from '@/types';

type WorkoutStore = {
  isReady: boolean;
  hasOnboarded: boolean;
  logs: WorkoutLog[];
  sessions: FullWorkoutSession[];
  bodyWeightLogs: BodyWeightEntry[];
  activeSession: ActiveWorkoutSession | null;
  customExercises: ExerciseDefinition[];
  exerciseNames: string[];
  allExercises: ExerciseDefinition[];
  frequency: WorkoutFrequency;
  schedule: ScheduleDay[];
  unitPreference: WeightUnit;
  themeId: ThemeId;
  profilePhotoUri?: string | null;
  athleteName?: string;
  stats: {
    totalSessions: number;
    thisWeekWorkouts: number;
    totalSets: number;
    totalVolume: number;
  };
  addLog: (input: {
    exerciseName: string;
    sets: WorkoutSet[];
    note?: string;
    unit?: WeightUnit;
    category?: MuscleGroup;
  }) => Promise<WorkoutLog>;
  addFullSession: (session: {
    title: string;
    exercises: WorkoutExercise[];
    durationMinutes?: number;
    unit?: WeightUnit;
  }) => Promise<FullWorkoutSession>;
  saveActiveSession: (session: ActiveWorkoutSession | null) => Promise<void>;
  clearActiveSession: () => Promise<void>;
  addBodyWeightLog: (
    weight: number | string,
    dateKey?: string,
    note?: string,
    unit?: WeightUnit,
  ) => Promise<BodyWeightEntry>;
  deleteBodyWeightLog: (id: string) => Promise<void>;
  deleteLog: (logId: string) => Promise<void>;
  deleteSessionByDate: (dateKey: string) => Promise<void>;
  addCustomExercise: (name: string, category: MuscleGroup) => Promise<ExerciseDefinition>;
  setFrequency: (frequency: WorkoutFrequency) => Promise<void>;
  updateScheduleDay: (day: DayOfWeek, label: string) => Promise<void>;
  setUnitPreference: (unit: WeightUnit) => Promise<void>;
  setThemeId: (themeId: ThemeId) => Promise<void>;
  setProfilePhotoUri: (uri: string | null) => Promise<void>;
  setAthleteName: (name: string) => Promise<void>;
  completeOnboarding: (prefs?: { unit?: WeightUnit; frequency?: WorkoutFrequency }) => Promise<void>;
  getExerciseSuggestions: (query: string) => string[];
};

const WorkoutContext = createContext<WorkoutStore | null>(null);

function normalizeExerciseName(name: string): string {
  return name.trim();
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    loadAppData().then((loaded) => {
      if (!loaded.unitPreference) loaded.unitPreference = 'kg';
      if (!loaded.sessions) loaded.sessions = [];
      if (!loaded.bodyWeightLogs) loaded.bodyWeightLogs = [];
      if (!loaded.customExercises) loaded.customExercises = [];
      setData(loaded);
    });
  }, []);

  const persist = useCallback(async (next: AppData) => {
    setData(next);
    await saveAppData(next);
  }, []);

  const allExercises = useMemo<ExerciseDefinition[]>(() => {
    const custom = data?.customExercises ?? [];
    return [...EXERCISE_LIBRARY, ...custom];
  }, [data?.customExercises]);

  const addLog = useCallback(
    async (input: {
      exerciseName: string;
      sets: WorkoutSet[];
      note?: string;
      unit?: WeightUnit;
      category?: MuscleGroup;
    }) => {
      const exerciseName = normalizeExerciseName(input.exerciseName);
      const currentUnit = input.unit ?? data?.unitPreference ?? 'kg';
      const category = input.category ?? getExerciseMuscleGroup(exerciseName);

      const log: WorkoutLog = {
        id: generateId(),
        exerciseName,
        sets: input.sets.map((s) => ({ ...s, unit: s.unit ?? currentUnit })),
        note: input.note?.trim() || undefined,
        timestamp: new Date().toISOString(),
        unit: currentUnit,
        category,
      };

      const current = data ?? (await loadAppData());
      const next: AppData = {
        ...current,
        logs: [log, ...(current.logs ?? [])],
        exerciseNames: current.exerciseNames.includes(exerciseName)
          ? current.exerciseNames
          : [...current.exerciseNames, exerciseName],
      };

      await persist(next);
      return log;
    },
    [data, persist],
  );

  const addFullSession = useCallback(
    async (input: {
      title: string;
      exercises: WorkoutExercise[];
      durationMinutes?: number;
      unit?: WeightUnit;
    }) => {
      const currentUnit = input.unit ?? data?.unitPreference ?? 'kg';
      const now = new Date();
      const iso = now.toISOString();
      const dateKey = toDateKey(iso);

      let totalVolume = 0;
      let totalSets = 0;
      const logsToCreate: WorkoutLog[] = [];

      for (const ex of input.exercises) {
        const validSets = ex.sets.filter((s) => s.weight.trim() || s.reps.trim());
        if (validSets.length > 0) {
          totalSets += validSets.length;
          for (const s of validSets) {
            const w = parseFloat(s.weight) || 0;
            const r = parseInt(s.reps, 10) || 0;
            totalVolume += w * r;
          }

          logsToCreate.push({
            id: generateId(),
            exerciseName: ex.exerciseName,
            sets: validSets.map((s) => ({ ...s, unit: s.unit ?? currentUnit })),
            note: ex.note,
            timestamp: iso,
            unit: currentUnit,
            category: ex.category ?? getExerciseMuscleGroup(ex.exerciseName),
          });
        }
      }

      const session: FullWorkoutSession = {
        id: generateId(),
        title: input.title.trim() || 'Workout Session',
        dateKey,
        timestamp: iso,
        durationMinutes: input.durationMinutes,
        exercises: input.exercises,
        totalVolume: Math.round(totalVolume),
        totalSets,
        unit: currentUnit,
      };

      const current = data ?? (await loadAppData());
      const next: AppData = {
        ...current,
        activeSession: null, // Clear active session on finish
        logs: [...logsToCreate, ...(current.logs ?? [])],
        sessions: [session, ...(current.sessions ?? [])],
      };

      await persist(next);
      return session;
    },
    [data, persist],
  );

  const saveActiveSession = useCallback(
    async (session: ActiveWorkoutSession | null) => {
      const current = data ?? (await loadAppData());
      const next: AppData = {
        ...current,
        activeSession: session,
      };
      await persist(next);
    },
    [data, persist],
  );

  const clearActiveSession = useCallback(async () => {
    const current = data ?? (await loadAppData());
    const next: AppData = {
      ...current,
      activeSession: null,
    };
    await persist(next);
  }, [data, persist]);

  const addBodyWeightLog = useCallback(
    async (
      weight: number | string,
      dateKeyInput?: string,
      note?: string,
      explicitUnit?: WeightUnit,
    ) => {
      const val = typeof weight === 'string' ? parseFloat(weight) : weight;
      const now = new Date();
      const iso = now.toISOString();
      const dateKey = dateKeyInput || toDateKey(iso);
      const unit = explicitUnit ?? data?.unitPreference ?? 'kg';

      const entry: BodyWeightEntry = {
        id: generateId(),
        weight: isNaN(val) ? 0 : Math.round(val * 10) / 10,
        unit,
        dateKey,
        timestamp: iso,
        note: note?.trim() || undefined,
      };

      const current = data ?? (await loadAppData());
      const next: AppData = {
        ...current,
        bodyWeightLogs: [entry, ...(current.bodyWeightLogs ?? [])].sort(
          (a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime(),
        ),
      };

      await persist(next);
      return entry;
    },
    [data, persist],
  );

  const deleteBodyWeightLog = useCallback(
    async (id: string) => {
      const current = data ?? (await loadAppData());
      const next: AppData = {
        ...current,
        bodyWeightLogs: (current.bodyWeightLogs ?? []).filter((e) => e.id !== id),
      };
      await persist(next);
    },
    [data, persist],
  );

  const deleteLog = useCallback(
    async (logId: string) => {
      const current = data ?? (await loadAppData());
      const next: AppData = {
        ...current,
        logs: current.logs.filter((l) => l.id !== logId),
      };
      await persist(next);
    },
    [data, persist],
  );

  const deleteSessionByDate = useCallback(
    async (dateKey: string) => {
      const current = data ?? (await loadAppData());
      const next: AppData = {
        ...current,
        logs: current.logs.filter((l) => toDateKey(l.timestamp) !== dateKey),
        sessions: current.sessions.filter((s) => s.dateKey !== dateKey),
      };
      await persist(next);
    },
    [data, persist],
  );

  const addCustomExercise = useCallback(
    async (name: string, category: MuscleGroup) => {
      const trimmed = normalizeExerciseName(name);
      const custom: ExerciseDefinition = {
        id: `custom-${generateId()}`,
        name: trimmed,
        category,
        isCustom: true,
      };

      const current = data ?? (await loadAppData());
      const next: AppData = {
        ...current,
        customExercises: [...(current.customExercises ?? []), custom],
        exerciseNames: current.exerciseNames.includes(trimmed)
          ? current.exerciseNames
          : [...current.exerciseNames, trimmed],
      };

      await persist(next);
      return custom;
    },
    [data, persist],
  );

  const setFrequency = useCallback(
    async (frequency: WorkoutFrequency) => {
      const current = data ?? (await loadAppData());
      const next: AppData = {
        ...current,
        frequency,
        schedule: buildSchedule(frequency),
      };
      await persist(next);
    },
    [data, persist],
  );

  const updateScheduleDay = useCallback(
    async (day: DayOfWeek, label: string) => {
      const current = data ?? (await loadAppData());
      const next: AppData = {
        ...current,
        schedule: current.schedule.map((entry) =>
          entry.day === day ? { ...entry, label: label.trim() || 'Rest' } : entry,
        ),
      };
      await persist(next);
    },
    [data, persist],
  );

  const setUnitPreference = useCallback(
    async (unitPreference: WeightUnit) => {
      const current = data ?? (await loadAppData());
      const next: AppData = { ...current, unitPreference };
      await persist(next);
    },
    [data, persist],
  );

  const setThemeId = useCallback(
    async (themeId: ThemeId) => {
      const current = data ?? (await loadAppData());
      const next: AppData = { ...current, themeId };
      await persist(next);
    },
    [data, persist],
  );

  const setProfilePhotoUri = useCallback(
    async (profilePhotoUri: string | null) => {
      const current = data ?? (await loadAppData());
      const next: AppData = { ...current, profilePhotoUri: profilePhotoUri || undefined };
      await persist(next);
    },
    [data, persist],
  );

  const setAthleteName = useCallback(
    async (athleteName: string) => {
      const current = data ?? (await loadAppData());
      const next: AppData = { ...current, athleteName: athleteName.trim() || undefined };
      await persist(next);
    },
    [data, persist],
  );

  const completeOnboarding = useCallback(
    async (prefs?: { unit?: WeightUnit; frequency?: WorkoutFrequency }) => {
      const current = data ?? (await loadAppData());
      const frequency = prefs?.frequency ?? current.frequency ?? 3;
      const unitPreference = prefs?.unit ?? current.unitPreference ?? 'kg';

      const next: AppData = {
        ...current,
        hasOnboarded: true,
        frequency,
        schedule: current.schedule.length > 0 ? current.schedule : buildSchedule(frequency),
        unitPreference,
      };
      await persist(next);
    },
    [data, persist],
  );

  const getExerciseSuggestions = useCallback(
    (query: string) => {
      const list = allExercises.map((e) => e.name);
      const trimmed = query.trim().toLowerCase();
      if (!trimmed) return list.slice(0, 12);

      return list.filter((name) => name.toLowerCase().includes(trimmed)).slice(0, 12);
    },
    [allExercises],
  );

  const stats = useMemo(() => calculateStats(data?.logs ?? []), [data?.logs]);

  const value = useMemo<WorkoutStore>(
    () => ({
      isReady: data !== null,
      hasOnboarded: data?.hasOnboarded ?? false,
      logs: data?.logs ?? [],
      sessions: data?.sessions ?? [],
      bodyWeightLogs: data?.bodyWeightLogs ?? [],
      activeSession: data?.activeSession ?? null,
      customExercises: data?.customExercises ?? [],
      exerciseNames: data?.exerciseNames ?? [],
      allExercises,
      frequency: data?.frequency ?? 3,
      schedule: data?.schedule ?? buildSchedule(3),
      unitPreference: data?.unitPreference ?? 'kg',
      themeId: data?.themeId ?? 'emerald',
      profilePhotoUri: data?.profilePhotoUri ?? null,
      athleteName: data?.athleteName ?? 'Athlete Profile',
      stats,
      addLog,
      addFullSession,
      saveActiveSession,
      clearActiveSession,
      addBodyWeightLog,
      deleteBodyWeightLog,
      deleteLog,
      deleteSessionByDate,
      addCustomExercise,
      setFrequency,
      updateScheduleDay,
      setUnitPreference,
      setThemeId,
      setProfilePhotoUri,
      setAthleteName,
      completeOnboarding,
      getExerciseSuggestions,
    }),
    [
      data,
      allExercises,
      stats,
      addLog,
      addFullSession,
      saveActiveSession,
      clearActiveSession,
      addBodyWeightLog,
      deleteBodyWeightLog,
      deleteLog,
      deleteSessionByDate,
      addCustomExercise,
      setFrequency,
      updateScheduleDay,
      setUnitPreference,
      setThemeId,
      setProfilePhotoUri,
      setAthleteName,
      completeOnboarding,
      getExerciseSuggestions,
    ],
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkoutStore() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkoutStore must be used within WorkoutProvider');
  }
  return context;
}
