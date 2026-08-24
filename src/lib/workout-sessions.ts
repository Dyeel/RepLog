import { ScheduleDay, WeightUnit, WorkoutLog } from '@/types';

import {
  formatMonthDay,
  formatSessionTitle,
  getDayOfWeekFromDateKey,
  toDateKey,
} from '@/lib/utils';

export type WorkoutSession = {
  dateKey: string;
  title: string;
  dateLabel: string;
  logs: WorkoutLog[];
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;
  unit: WeightUnit;
  timestamp: string;
};

export function groupLogsIntoSessions(
  logs: WorkoutLog[],
  schedule: ScheduleDay[],
  defaultUnit: WeightUnit = 'kg',
): WorkoutSession[] {
  const map = new Map<string, WorkoutLog[]>();

  for (const log of logs) {
    const key = toDateKey(log.timestamp);
    const existing = map.get(key) ?? [];
    existing.push(log);
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .map(([dateKey, dayLogs]) => {
      const sortedLogs = [...dayLogs].sort((a, b) =>
        a.exerciseName.localeCompare(b.exerciseName),
      );
      const totalSets = sortedLogs.reduce((sum, log) => sum + log.sets.length, 0);
      const dayOfWeek = getDayOfWeekFromDateKey(dateKey);

      let totalVolume = 0;
      for (const log of sortedLogs) {
        for (const set of log.sets) {
          const w = parseFloat(set.weight) || 0;
          const r = parseInt(set.reps, 10) || 0;
          totalVolume += w * r;
        }
      }

      const sessionUnit = dayLogs[0]?.unit ?? defaultUnit;

      return {
        dateKey,
        title: formatSessionTitle(dayOfWeek, schedule),
        dateLabel: formatMonthDay(dateKey),
        logs: sortedLogs,
        exerciseCount: sortedLogs.length,
        totalSets,
        totalVolume: Math.round(totalVolume),
        unit: sessionUnit,
        timestamp: dayLogs.reduce(
          (latest, log) => (log.timestamp > latest ? log.timestamp : latest),
          dayLogs[0].timestamp,
        ),
      };
    })
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export function getSessionByDateKey(
  logs: WorkoutLog[],
  schedule: ScheduleDay[],
  dateKey: string,
  defaultUnit: WeightUnit = 'kg',
): WorkoutSession | undefined {
  return groupLogsIntoSessions(logs, schedule, defaultUnit).find(
    (session) => session.dateKey === dateKey,
  );
}
