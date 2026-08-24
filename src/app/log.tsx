import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ExercisePickerModal,
  OneRepMaxPreview,
  PlateCalculatorModal,
  PreviousPerformanceCard,
  RestTimer,
  SetRow,
} from '@/components/workout';
import { UnitConverterModal } from '@/components/tools';
import { ExerciseThumbnail, GradientButton, UnitToggle } from '@/components/ui';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import {
  calculate1RM,
  convertWeight,
  generateId,
  getPreviousExercisePerformance,
  getTodayDayOfWeek,
} from '@/lib/utils';
import { ExerciseDefinition, SetType, WeightUnit, WorkoutExercise, WorkoutSet } from '@/types';

function createEmptySet(unit: WeightUnit = 'kg', type: SetType = 'normal'): WorkoutSet {
  return { id: generateId(), weight: '', reps: '', unit, type };
}

export default function LogWorkoutScreen() {
  const params = useLocalSearchParams<{ title?: string }>();
  const {
    isReady,
    activeSession,
    saveActiveSession,
    clearActiveSession,
    addFullSession,
    logs,
    schedule,
    unitPreference,
    setUnitPreference,
  } = useWorkoutStore();

  const today = getTodayDayOfWeek();
  const defaultTitle = params.title || schedule.find((s) => s.day === today)?.label || 'Workout';
  const initialTitle =
    activeSession?.title || (defaultTitle === 'Rest' ? 'Workout' : `${defaultTitle} Session`);

  const [sessionTitle, setSessionTitle] = useState(initialTitle);
  const [selectedUnit, setSelectedUnit] = useState<WeightUnit>(
    activeSession?.unit || unitPreference,
  );
  const [exercises, setExercises] = useState<WorkoutExercise[]>(activeSession?.exercises || []);
  const [saving, setSaving] = useState(false);

  // Modals state
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [plateCalcWeight, setPlateCalcWeight] = useState<string | null>(null);
  const [isConverterVisible, setIsConverterVisible] = useState(false);

  // Persistent Timer calculation based on startTimestamp
  const startTimestampRef = useRef<number>(activeSession?.startTimestamp || Date.now());
  const [secondsElapsed, setSecondsElapsed] = useState(
    Math.max(0, Math.floor((Date.now() - startTimestampRef.current) / 1000)),
  );

  // Initialize active session in store on first mount if none exists
  useEffect(() => {
    if (!activeSession) {
      const now = Date.now();
      startTimestampRef.current = now;
      saveActiveSession({
        title: initialTitle,
        startTimestamp: now,
        exercises: [],
        unit: selectedUnit,
      });
      // Show exercise picker once if no exercises
      setIsPickerVisible(true);
    }
  }, []);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed(
        Math.max(0, Math.floor((Date.now() - startTimestampRef.current) / 1000)),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync active session state to store whenever exercises/title/unit change
  const syncToActiveSession = (
    nextExercises: WorkoutExercise[],
    nextUnit: WeightUnit = selectedUnit,
    nextTitle: string = sessionTitle,
  ) => {
    saveActiveSession({
      title: nextTitle,
      startTimestamp: startTimestampRef.current,
      exercises: nextExercises,
      unit: nextUnit,
    });
  };

  const formattedDuration = useMemo(() => {
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, [secondsElapsed]);

  const handleUnitChange = (nextUnit: WeightUnit) => {
    if (nextUnit === selectedUnit) return;
    const updated = exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((set) => ({
        ...set,
        weight: set.weight ? convertWeight(set.weight, selectedUnit, nextUnit) : '',
        unit: nextUnit,
      })),
    }));
    setExercises(updated);
    setSelectedUnit(nextUnit);
    setUnitPreference(nextUnit);
    syncToActiveSession(updated, nextUnit);
  };

  const handleAddExercise = (def: ExerciseDefinition) => {
    const newEx: WorkoutExercise = {
      id: generateId(),
      exerciseName: def.name,
      category: def.category,
      imageUrl: def.imageUrl,
      sets: [createEmptySet(selectedUnit)],
    };
    const updated = [...exercises, newEx];
    setExercises(updated);
    syncToActiveSession(updated);
  };

  const updateSet = (
    exerciseId: string,
    setId: string,
    field: 'weight' | 'reps',
    val: string,
  ) => {
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: val } : s)),
      };
    });
    setExercises(updated);
    syncToActiveSession(updated);
  };

  const toggleSetType = (exerciseId: string, setId: string) => {
    const SET_TYPES: SetType[] = ['normal', 'warmup', 'dropset', 'failure'];
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s) => {
          if (s.id !== setId) return s;
          const current = s.type ?? 'normal';
          const nextIdx = (SET_TYPES.indexOf(current) + 1) % SET_TYPES.length;
          return { ...s, type: SET_TYPES[nextIdx] };
        }),
      };
    });
    setExercises(updated);
    syncToActiveSession(updated);
  };

  const addSetToExercise = (exerciseId: string) => {
    const updated: WorkoutExercise[] = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const last = ex.sets[ex.sets.length - 1];
      return {
        ...ex,
        sets: [
          ...ex.sets,
          {
            id: generateId(),
            weight: last?.weight ?? '',
            reps: last?.reps ?? '',
            unit: selectedUnit,
            type: 'normal' as SetType,
          },
        ],
      };
    });
    setExercises(updated);
    syncToActiveSession(updated);
  };

  const duplicateSetInExercise = (exerciseId: string, setId: string) => {
    const updated: WorkoutExercise[] = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const target = ex.sets.find((s) => s.id === setId);
      if (!target) return ex;
      return {
        ...ex,
        sets: [
          ...ex.sets,
          {
            id: generateId(),
            weight: target.weight,
            reps: target.reps,
            unit: selectedUnit,
            type: (target.type ?? 'normal') as SetType,
          },
        ],
      };
    });
    setExercises(updated);
    syncToActiveSession(updated);
  };

  const removeSetFromExercise = (exerciseId: string, setId: string) => {
    const updated = exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        sets: ex.sets.length > 1 ? ex.sets.filter((s) => s.id !== setId) : ex.sets,
      };
    });
    setExercises(updated);
    syncToActiveSession(updated);
  };

  const removeExercise = (exerciseId: string) => {
    const updated = exercises.filter((ex) => ex.id !== exerciseId);
    setExercises(updated);
    syncToActiveSession(updated);
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Workout?',
      'Are you sure you want to end and discard this workout session? Logged sets will not be saved.',
      [
        { text: 'Keep Logging', style: 'cancel' },
        {
          text: 'Discard Workout',
          style: 'destructive',
          onPress: async () => {
            await clearActiveSession();
            router.back();
          },
        },
      ],
    );
  };

  const handleFinishWorkout = async () => {
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Please add at least one exercise to save the session.');
      return;
    }

    const hasAnyValidSet = exercises.some((ex) =>
      ex.sets.some((s) => s.weight.trim() || s.reps.trim()),
    );

    if (!hasAnyValidSet) {
      Alert.alert('Empty Sets', 'Please log at least one set with weight or reps.');
      return;
    }

    setSaving(true);
    try {
      const durationMins = Math.max(1, Math.round(secondsElapsed / 60));
      await addFullSession({
        title: sessionTitle,
        exercises,
        durationMinutes: durationMins,
        unit: selectedUnit,
      });

      router.back();
    } finally {
      setSaving(false);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Brand.emerald} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header Bar */}
          <View style={styles.topBar}>
            <Pressable
              onPress={() => {
                // Minimize without discarding!
                router.back();
              }}
              style={styles.minimizeBtn}>
              <MaterialCommunityIcons name="chevron-down" size={24} color="#FFFFFF" />
            </Pressable>

            {/* Session Info & Timer */}
            <View style={styles.headerMiddle}>
              <Text style={styles.sessionTitleText}>{sessionTitle}</Text>
              <View style={styles.timerBadge}>
                <MaterialCommunityIcons name="clock-outline" size={12} color={Brand.emerald} />
                <Text style={styles.timerText}>{formattedDuration}</Text>
              </View>
            </View>

            <View style={styles.topBarRight}>
              <Pressable
                onPress={() => setIsConverterVisible(true)}
                style={styles.calcTriggerBtn}>
                <MaterialCommunityIcons name="swap-horizontal" size={18} color={Brand.emerald} />
              </Pressable>
              <UnitToggle value={selectedUnit} onChange={handleUnitChange} compact />
              <Pressable onPress={handleDiscard} style={styles.discardIconBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={Brand.danger} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Rest Interval Timer Component */}
            <RestTimer />

            {/* Exercises List */}
            {exercises.map((exercise, exIndex) => {
              const previousPerf = getPreviousExercisePerformance(exercise.exerciseName, logs);

              return (
                <View key={exercise.id} style={styles.exerciseCard}>
                  {/* Exercise Header with Thumbnail Picture */}
                  <View style={styles.exerciseCardHeader}>
                    <View style={styles.exerciseHeaderLeft}>
                      <ExerciseThumbnail
                        exerciseName={exercise.exerciseName}
                        imageUrl={exercise.imageUrl}
                        category={exercise.category}
                        size={48}
                      />

                      <View style={styles.exerciseTitleCol}>
                        <View style={styles.exerciseNameRow}>
                          <Text style={styles.exerciseIndex}>{exIndex + 1}.</Text>
                          <Text style={styles.exerciseCardTitle} numberOfLines={1}>
                            {exercise.exerciseName}
                          </Text>
                        </View>
                        {exercise.category && (
                          <Text style={styles.exerciseCategoryTag}>
                            {exercise.category.toUpperCase()}
                          </Text>
                        )}
                      </View>
                    </View>

                    <Pressable
                      onPress={() => removeExercise(exercise.id)}
                      style={styles.removeExerciseBtn}>
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={18}
                        color={Brand.danger}
                      />
                    </Pressable>
                  </View>

                  {/* Previous Session Reference Card */}
                  {previousPerf && (
                    <PreviousPerformanceCard
                      performance={previousPerf}
                      currentUnit={selectedUnit}
                      onApplyPreviousSets={(prevSets) => {
                        const updated = exercises.map((ex) =>
                          ex.id === exercise.id
                            ? {
                                ...ex,
                                sets: prevSets.map((s) => ({
                                  ...s,
                                  id: generateId(),
                                  unit: selectedUnit,
                                })),
                              }
                            : ex,
                        );
                        setExercises(updated);
                        syncToActiveSession(updated);
                      }}
                    />
                  )}

                  {/* Sets Rows */}
                  <View style={styles.setsList}>
                    {exercise.sets.map((set, setIndex) => (
                      <SetRow
                        key={set.id}
                        set={set}
                        index={setIndex}
                        unit={selectedUnit}
                        onChange={(setId, field, val) =>
                          updateSet(exercise.id, setId, field, val)
                        }
                        onToggleType={(setId) => toggleSetType(exercise.id, setId)}
                        onOpenPlateCalculator={(w) => setPlateCalcWeight(w)}
                        onRemove={(setId) => removeSetFromExercise(exercise.id, setId)}
                        onDuplicate={(setId) => duplicateSetInExercise(exercise.id, setId)}
                        canRemove={exercise.sets.length > 1}
                      />
                    ))}
                  </View>

                  {/* Add Set Button */}
                  <Pressable
                    onPress={() => addSetToExercise(exercise.id)}
                    style={({ pressed }) => [styles.addSetBtn, pressed && styles.pressed]}>
                    <MaterialCommunityIcons name="plus" size={16} color={Brand.textPrimary} />
                    <Text style={styles.addSetText}>Add Set</Text>
                  </Pressable>
                </View>
              );
            })}

            {/* Add Exercise Action Trigger */}
            <Pressable
              onPress={() => setIsPickerVisible(true)}
              style={({ pressed }) => [styles.addExerciseCard, pressed && styles.pressed]}>
              <MaterialCommunityIcons name="plus-circle-outline" size={22} color={Brand.emerald} />
              <Text style={styles.addExerciseText}>Add Exercise to Workout</Text>
            </Pressable>

            {/* Finish Workout CTA */}
            {exercises.length > 0 && (
              <View style={styles.footer}>
                <GradientButton
                  label={saving ? 'Saving Workout...' : 'Finish Workout Session'}
                  icon={<MaterialCommunityIcons name="check" size={20} color="#050507" />}
                  onPress={handleFinishWorkout}
                  disabled={saving}
                />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Exercise Picker Modal */}
        <ExercisePickerModal
          visible={isPickerVisible}
          onSelectExercise={handleAddExercise}
          onClose={() => setIsPickerVisible(false)}
        />

        {/* Barbell Plate Calculator Modal */}
        {plateCalcWeight && (
          <PlateCalculatorModal
            visible={!!plateCalcWeight}
            initialWeight={plateCalcWeight}
            unit={selectedUnit}
            onClose={() => setPlateCalcWeight(null)}
          />
        )}

        {/* KG ⇄ LBS Converter Modal */}
        <UnitConverterModal
          visible={isConverterVisible}
          onClose={() => setIsConverterVisible(false)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.background,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Brand.cardBorder,
  },
  minimizeBtn: {
    padding: 6,
    borderRadius: Radius.sm,
    backgroundColor: Brand.card,
  },
  headerMiddle: {
    alignItems: 'center',
    gap: 2,
  },
  sessionTitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Brand.emeraldMuted,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  timerText: {
    color: Brand.emerald,
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  calcTriggerBtn: {
    padding: 6,
    borderRadius: Radius.sm,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  discardIconBtn: {
    padding: 6,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  exerciseCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  exerciseTitleCol: {
    gap: 2,
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseIndex: {
    color: Brand.textMuted,
    fontSize: 16,
    fontWeight: '800',
  },
  exerciseCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  exerciseCategoryTag: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  removeExerciseBtn: {
    padding: 6,
    borderRadius: Radius.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  setsList: {
    gap: Spacing.two,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: Brand.cardElevated,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  addSetText: {
    color: Brand.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  addExerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
    borderRadius: Radius.lg,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  addExerciseText: {
    color: Brand.emerald,
    fontSize: 15,
    fontWeight: '800',
  },
  footer: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  pressed: {
    opacity: 0.8,
  },
});
