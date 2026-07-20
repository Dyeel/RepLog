export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type WorkoutFrequency = 2 | 3 | 4;

export type WorkoutSet = {
  id: string;
  weight: string;
  reps: string;
};

export type WorkoutLog = {
  id: string;
  exerciseName: string;
  sets: WorkoutSet[];
  note?: string;
  timestamp: string;
};

export type ScheduleDay = {
  day: DayOfWeek;
  label: string;
};

export type AppData = {
  logs: WorkoutLog[];
  exerciseNames: string[];
  frequency: WorkoutFrequency;
  schedule: ScheduleDay[];
};

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const WORKOUT_LABELS = [
  'Upper',
  'Lower',
  'Push',
  'Pull',
  'Legs',
  'Full Body',
  'Rest',
] as const;
