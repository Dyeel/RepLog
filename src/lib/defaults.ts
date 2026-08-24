import { EXERCISE_LIBRARY } from '@/lib/exercise-library';
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
        monday: 'Push',
        tuesday: 'Rest',
        wednesday: 'Pull',
        thursday: 'Rest',
        friday: 'Legs',
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
        saturday: 'Rest',
        sunday: 'Rest',
      };
    case 5:
      return {
        monday: 'Push',
        tuesday: 'Pull',
        wednesday: 'Legs',
        thursday: 'Rest',
        friday: 'Upper',
        saturday: 'Lower',
        sunday: 'Rest',
      };
    case 6:
      return {
        monday: 'Push',
        tuesday: 'Pull',
        wednesday: 'Legs',
        thursday: 'Push',
        friday: 'Pull',
        saturday: 'Legs',
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
    sessions: [],
    bodyWeightLogs: [],
    customExercises: [],
    exerciseNames: EXERCISE_LIBRARY.map((e) => e.name),
    frequency,
    schedule: buildSchedule(frequency),
    hasOnboarded: false,
    unitPreference: 'kg',
  };
}
