import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { buildSchedule } from '@/lib/defaults';
import { loadAppData, saveAppData } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import {
  AppData,
  DayOfWeek,
  ScheduleDay,
  WorkoutFrequency,
  WorkoutLog,
  WorkoutSet,
} from '@/types';

type WorkoutStore = {
  isReady: boolean;
  logs: WorkoutLog[];
  exerciseNames: string[];
  frequency: WorkoutFrequency;
  schedule: ScheduleDay[];
  addLog: (input: {
    exerciseName: string;
    sets: WorkoutSet[];
    note?: string;
  }) => Promise<WorkoutLog>;
  setFrequency: (frequency: WorkoutFrequency) => Promise<void>;
  updateScheduleDay: (day: DayOfWeek, label: string) => Promise<void>;
  getExerciseSuggestions: (query: string) => string[];
};

const WorkoutContext = createContext<WorkoutStore | null>(null);

function normalizeExerciseName(name: string): string {
  return name.trim();
}

function upsertExerciseName(names: string[], exerciseName: string): string[] {
  const normalized = normalizeExerciseName(exerciseName);
  if (!normalized) return names;

  const exists = names.some((name) => name.toLowerCase() === normalized.toLowerCase());
  if (exists) return names;

  return [...names, normalized].sort((a, b) => a.localeCompare(b));
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    loadAppData().then(setData);
  }, []);

  const persist = useCallback(async (next: AppData) => {
    setData(next);
    await saveAppData(next);
  }, []);

  const addLog = useCallback(
    async (input: { exerciseName: string; sets: WorkoutSet[]; note?: string }) => {
      const exerciseName = normalizeExerciseName(input.exerciseName);
      const log: WorkoutLog = {
        id: generateId(),
        exerciseName,
        sets: input.sets,
        note: input.note?.trim() || undefined,
        timestamp: new Date().toISOString(),
      };

      const current = data ?? (await loadAppData());
      const next: AppData = {
        ...current,
        logs: [log, ...current.logs],
        exerciseNames: upsertExerciseName(current.exerciseNames, exerciseName),
      };

      await persist(next);
      return log;
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

  const getExerciseSuggestions = useCallback(
    (query: string) => {
      const names = data?.exerciseNames ?? [];
      const trimmed = query.trim().toLowerCase();
      if (!trimmed) return names.slice(0, 8);

      return names.filter((name) => name.toLowerCase().includes(trimmed)).slice(0, 8);
    },
    [data?.exerciseNames],
  );

  const value = useMemo<WorkoutStore>(
    () => ({
      isReady: data !== null,
      logs: data?.logs ?? [],
      exerciseNames: data?.exerciseNames ?? [],
      frequency: data?.frequency ?? 3,
      schedule: data?.schedule ?? buildSchedule(3),
      addLog,
      setFrequency,
      updateScheduleDay,
      getExerciseSuggestions,
    }),
    [addLog, data, getExerciseSuggestions, setFrequency, updateScheduleDay],
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
