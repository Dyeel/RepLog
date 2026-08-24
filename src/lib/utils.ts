import { DayOfWeek, OneRepMaxData, ScheduleDay, WeightUnit, WorkoutLog, WorkoutSet } from '@/types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[new Date().getDay()];
}

export function toDateKey(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayOfWeekFromDateKey(dateKey: string): DayOfWeek {
  const [year, month, day] = dateKey.split('-').map(Number);
  const days: DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[new Date(year, month - 1, day).getDay()];
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatHeaderDate(date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonthDay(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatSessionTitle(day: DayOfWeek, schedule: ScheduleDay[]): string {
  const label = schedule.find((entry) => entry.day === day)?.label ?? 'Workout';
  if (label.trim().toLowerCase() === 'rest') return 'Workout Session';
  return `${label} Day`;
}

const SCHEDULE_ABBREVIATIONS: Record<string, string> = {
  Upper: 'U',
  Lower: 'L',
  Rest: 'R',
  Push: 'P',
  Pull: 'Pu',
  Legs: 'Lg',
  'Full Body': 'FB',
  'Chest & Triceps': 'CT',
  'Back & Biceps': 'BB',
  'Shoulders & Arms': 'SA',
  'Cardio & Core': 'CC',
};

export function getScheduleAbbreviation(label: string): string {
  return SCHEDULE_ABBREVIATIONS[label] ?? label.slice(0, 2).toUpperCase();
}

export function isRestDay(label: string): boolean {
  return label.trim().toLowerCase() === 'rest';
}

export function formatSetLine(weight: string, reps: string, unit: WeightUnit = 'kg'): string {
  const w = weight.trim();
  const r = reps.trim() || '0';
  if (!w || w === '0') {
    return `${r} reps`;
  }
  return `${w} ${unit} × ${r}`;
}

export function convertWeight(value: string, from: WeightUnit, to: WeightUnit): string {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return value;
  if (from === to) return value;

  if (from === 'kg' && to === 'lbs') {
    return (num * 2.20462).toFixed(1).replace(/\.0$/, '');
  } else if (from === 'lbs' && to === 'kg') {
    return (num / 2.20462).toFixed(1).replace(/\.0$/, '');
  }
  return value;
}

// ----------------------------------------------------
// 1RM Calculation & Training Percentages (Epley Formula)
// ----------------------------------------------------
export function calculate1RM(weight: number | string, reps: number | string): number {
  const w = typeof weight === 'string' ? parseFloat(weight) : weight;
  const r = typeof reps === 'string' ? parseInt(reps, 10) : reps;

  if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) return 0;
  if (r === 1) return Math.round(w);

  // Epley formula: 1RM = Weight * (1 + Reps / 30)
  return Math.round(w * (1 + r / 30));
}

export function calculate1RMData(weight: number | string, reps: number | string): OneRepMaxData | null {
  const estimated1RM = calculate1RM(weight, reps);
  if (estimated1RM <= 0) return null;

  return {
    estimated1RM,
    percentages: [
      { percentage: 95, weight: Math.round(estimated1RM * 0.95), repsRange: '1-2 reps' },
      { percentage: 90, weight: Math.round(estimated1RM * 0.9), repsRange: '3-4 reps' },
      { percentage: 85, weight: Math.round(estimated1RM * 0.85), repsRange: '5-6 reps' },
      { percentage: 80, weight: Math.round(estimated1RM * 0.8), repsRange: '7-8 reps' },
      { percentage: 75, weight: Math.round(estimated1RM * 0.75), repsRange: '9-10 reps' },
      { percentage: 70, weight: Math.round(estimated1RM * 0.7), repsRange: '11-12 reps' },
    ],
  };
}

// ----------------------------------------------------
// Previous Exercise Performance Lookup (Ghost Tracker)
// ----------------------------------------------------
export type PreviousPerformance = {
  dateLabel: string;
  timestamp: string;
  sets: WorkoutSet[];
  bestSet: WorkoutSet;
  estimated1RM: number;
  unit: WeightUnit;
};

export function getPreviousExercisePerformance(
  exerciseName: string,
  logs: WorkoutLog[],
): PreviousPerformance | null {
  const norm = exerciseName.trim().toLowerCase();
  if (!norm) return null;

  const matches = logs.filter((log) => log.exerciseName.trim().toLowerCase() === norm);
  if (matches.length === 0) return null;

  // Most recent log
  const recent = matches[0];
  let best1RM = 0;
  let bestSet = recent.sets[0];

  for (const set of recent.sets) {
    const rm = calculate1RM(set.weight, set.reps);
    if (rm > best1RM) {
      best1RM = rm;
      bestSet = set;
    }
  }

  return {
    dateLabel: formatMonthDay(toDateKey(recent.timestamp)),
    timestamp: recent.timestamp,
    sets: recent.sets,
    bestSet: bestSet ?? recent.sets[0],
    estimated1RM: best1RM,
    unit: recent.unit ?? 'kg',
  };
}

export function detectIsPR(
  exerciseName: string,
  weight: number | string,
  reps: number | string,
  logs: WorkoutLog[],
): boolean {
  const current1RM = calculate1RM(weight, reps);
  if (current1RM <= 0) return false;

  const previous = getPreviousExercisePerformance(exerciseName, logs);
  if (!previous || previous.estimated1RM <= 0) return false;

  return current1RM > previous.estimated1RM;
}

export function calculateStats(logs: WorkoutLog[]) {
  const dateKeys = new Set<string>();
  let totalSets = 0;
  let totalVolume = 0;

  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  let thisWeekWorkouts = 0;
  const thisWeekKeys = new Set<string>();

  for (const log of logs) {
    const key = toDateKey(log.timestamp);
    dateKeys.add(key);

    const logDate = new Date(log.timestamp);
    if (logDate >= startOfWeek) {
      thisWeekKeys.add(key);
    }

    for (const set of log.sets) {
      totalSets += 1;
      const w = parseFloat(set.weight) || 0;
      const r = parseInt(set.reps, 10) || 0;
      totalVolume += w * r;
    }
  }

  thisWeekWorkouts = thisWeekKeys.size;

  return {
    totalSessions: dateKeys.size,
    thisWeekWorkouts,
    totalSets,
    totalVolume: Math.round(totalVolume),
  };
}
