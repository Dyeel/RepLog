export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type WeightUnit = 'kg' | 'lbs';

export type WorkoutFrequency = 2 | 3 | 4 | 5 | 6;

export type SetType = 'warmup' | 'normal' | 'dropset' | 'failure';

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Full Body'
  | 'Cardio';

export type ExerciseDefinition = {
  id: string;
  name: string;
  category: MuscleGroup;
  imageUrl?: string;
  isCustom?: boolean;
};

export type WorkoutSet = {
  id: string;
  weight: string;
  reps: string;
  unit?: WeightUnit;
  type?: SetType;
  rpe?: number;
  isPR?: boolean;
  completed?: boolean;
};

export type WorkoutExercise = {
  id: string;
  exerciseName: string;
  category?: MuscleGroup;
  imageUrl?: string;
  sets: WorkoutSet[];
  note?: string;
};

export type ActiveWorkoutSession = {
  title: string;
  startTimestamp: number;
  exercises: WorkoutExercise[];
  unit: WeightUnit;
};

export type FullWorkoutSession = {
  id: string;
  title: string;
  dateKey: string;
  timestamp: string;
  durationMinutes?: number;
  exercises: WorkoutExercise[];
  totalVolume: number;
  totalSets: number;
  unit: WeightUnit;
};

export type WorkoutLog = {
  id: string;
  exerciseName: string;
  sets: WorkoutSet[];
  note?: string;
  timestamp: string;
  unit?: WeightUnit;
  category?: MuscleGroup;
  imageUrl?: string;
};

export type BodyWeightEntry = {
  id: string;
  weight: number;
  unit: WeightUnit;
  dateKey: string;
  timestamp: string;
  note?: string;
};

export type ScheduleDay = {
  day: DayOfWeek;
  label: string;
};

export type ThemeId =
  | 'emerald'
  | 'cobalt'
  | 'violet'
  | 'amber'
  | 'crimson'
  | 'platinum';

export type AppData = {
  logs: WorkoutLog[];
  sessions: FullWorkoutSession[];
  bodyWeightLogs: BodyWeightEntry[];
  activeSession?: ActiveWorkoutSession | null;
  customExercises: ExerciseDefinition[];
  exerciseNames: string[];
  frequency: WorkoutFrequency;
  schedule: ScheduleDay[];
  hasOnboarded: boolean;
  unitPreference: WeightUnit;
  themeId?: ThemeId;
};

export type OneRepMaxData = {
  estimated1RM: number;
  percentages: {
    percentage: number;
    weight: number;
    repsRange: string;
  }[];
};

export type PlateCalculation = {
  barWeight: number;
  targetWeight: number;
  weightPerSide: number;
  plates: {
    weight: number;
    count: number;
    color: string;
  }[];
  remainder: number;
  unit: WeightUnit;
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

export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

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
  'Push',
  'Pull',
  'Legs',
  'Upper',
  'Lower',
  'Full Body',
  'Chest & Triceps',
  'Back & Biceps',
  'Shoulders & Arms',
  'Core & Cardio',
  'Rest',
] as const;

export type WorkoutLabelType = (typeof WORKOUT_LABELS)[number];
