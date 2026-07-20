import { AppData, DayOfWeek, ScheduleDay, WorkoutFrequency } from '@/types';

export function getDefaultSplit(frequency: WorkoutFrequency): Record<DayOfWeek, string> {
  switch (frequency) {
    case 2:
      return {
        monday: 'Upper',
        tuesday: 'Rest',
        wednesday: 'Lower',
        thursday: 'Rest',
        friday: 'Rest',
        saturday: 'Rest',
        sunday: 'Rest',
      };
    case 3:
      return {
        monday: 'Upper',
        tuesday: 'Lower',
        wednesday: 'Rest',
        thursday: 'Upper',
        friday: 'Lower',
        saturday: 'Rest',
        sunday: 'Rest',
      };
    case 4:
      return {
        monday: 'Upper',
        tuesday: 'Lower',
        wednesday: 'Rest',
        thursday: 'Upper',
        friday: 'Lower',
        saturday: 'Full Body',
        sunday: 'Rest',
      };
  }
}

export function buildSchedule(frequency: WorkoutFrequency): ScheduleDay[] {
  const split = getDefaultSplit(frequency);
  return (Object.keys(split) as DayOfWeek[]).map((day) => ({
    day,
    label: split[day],
  }));
}

export function getDefaultAppData(): AppData {
  const frequency: WorkoutFrequency = 3;
  return {
    logs: [],
    exerciseNames: [],
    frequency,
    schedule: buildSchedule(frequency),
  };
}
