import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlateCalculatorModal } from '@/components/workout';
import { ExerciseThumbnail } from '@/components/ui';
import { Brand, Radius, Spacing, getSplitBadgeColor } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { calculate1RM, formatDate, formatMonthDay, formatSetLine } from '@/lib/utils';
import { getSessionByDateKey } from '@/lib/workout-sessions';

export default function WorkoutDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { isReady, logs, schedule, unitPreference, deleteLog, deleteSessionByDate } =
    useWorkoutStore();
  const [plateCalcWeight, setPlateCalcWeight] = useState<string | null>(null);

  const session = useMemo(() => {
    return date ? getSessionByDateKey(logs, schedule, date, unitPreference) : undefined;
  }, [date, logs, schedule, unitPreference]);

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Brand.emerald} />
      </View>
    );
  }

  if (!session || session.logs.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <MaterialCommunityIcons
              name="clipboard-text-off-outline"
              size={48}
              color={Brand.textMuted}
            />
            <Text style={styles.notFoundTitle}>Workout Not Found</Text>
            <Text style={styles.notFoundMessage}>
              No workout logs found for this date, or the session was deleted.
            </Text>
            <Pressable onPress={() => router.back()} style={styles.backLink}>
              <Text style={styles.backLinkText}>Return to History</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const splitColor = getSplitBadgeColor(session.title);

  // Calculate Peak 1RM achieved in this session
  let peak1RM = 0;
  let peakExercise = '';
  for (const log of session.logs) {
    for (const s of log.sets) {
      const rm = calculate1RM(s.weight, s.reps);
      if (rm > peak1RM) {
        peak1RM = rm;
        peakExercise = log.exerciseName;
      }
    }
  }

  const handleDeleteSession = () => {
    Alert.alert(
      'Delete Workout Session?',
      `Are you sure you want to delete the entire ${session.title} on ${formatMonthDay(session.dateKey)}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Workout',
          style: 'destructive',
          onPress: async () => {
            await deleteSessionByDate(session.dateKey);
            router.back();
          },
        },
      ],
    );
  };

  const handleDeleteExercise = (logId: string, exerciseName: string) => {
    Alert.alert(
      'Delete Exercise?',
      `Remove ${exerciseName} from this session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteLog(logId);
          },
        },
      ],
    );
  };

  const handleRepeatWorkout = () => {
    router.push(`/log?title=${encodeURIComponent(session.title)}` as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Top Bar Actions */}
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
            </Pressable>

            <View style={styles.topBarActions}>
              <Pressable
                onPress={handleDeleteSession}
                style={[styles.iconBtn, styles.deleteBtn]}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={Brand.danger} />
              </Pressable>
            </View>
          </View>

          {/* Session Hero Banner */}
          <View style={styles.heroCard}>
            <View style={styles.heroHeaderRow}>
              <View
                style={[
                  styles.splitBadge,
                  { backgroundColor: splitColor.bg, borderColor: splitColor.border },
                ]}>
                <Text style={[styles.splitBadgeText, { color: splitColor.text }]}>
                  {session.title.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.dateLabel}>{formatDate(session.logs[0]?.timestamp || '')}</Text>
            </View>

            <Text style={styles.heroTitle}>{session.title} Breakdown</Text>

            {/* Repeat Workout Action */}
            <Pressable
              onPress={handleRepeatWorkout}
              style={({ pressed }) => [styles.repeatBtn, pressed && styles.pressed]}>
              <MaterialCommunityIcons name="repeat" size={16} color="#050507" />
              <Text style={styles.repeatBtnText}>Repeat This Workout</Text>
            </Pressable>
          </View>

          {/* Executive Analytics Ribbon */}
          <View style={styles.analyticsRibbon}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>TOTAL VOLUME</Text>
              <Text style={styles.metricValue}>
                {session.totalVolume.toLocaleString()}{' '}
                <Text style={styles.metricUnit}>{session.unit}</Text>
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>WORK SETS</Text>
              <Text style={styles.metricValue}>{session.totalSets}</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>MOVEMENTS</Text>
              <Text style={styles.metricValue}>{session.exerciseCount}</Text>
            </View>

            {peak1RM > 0 && (
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>PEAK 1RM</Text>
                <Text style={styles.metricValue}>
                  {peak1RM} <Text style={styles.metricUnit}>{session.unit}</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Detailed Movements List */}
          <View style={styles.movementsSection}>
            <Text style={styles.sectionHeading}>
              EXERCISES PERFORMED ({session.logs.length})
            </Text>

            {session.logs.map((log, index) => {
              // Calculate volume and top set for this specific movement
              let exVol = 0;
              let topSet = log.sets[0];
              let maxRM = 0;
              for (const s of log.sets) {
                const w = parseFloat(s.weight) || 0;
                const r = parseInt(s.reps, 10) || 0;
                exVol += w * r;
                const rm = calculate1RM(s.weight, s.reps);
                if (rm > maxRM) {
                  maxRM = rm;
                  topSet = s;
                }
              }

              return (
                <View key={log.id} style={styles.exerciseCard}>
                  {/* Card Header with thumbnail & delete button */}
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseHeaderLeft}>
                      <ExerciseThumbnail
                        exerciseName={log.exerciseName}
                        imageUrl={log.imageUrl}
                        category={log.category}
                        size={52}
                      />

                      <View style={styles.exerciseTitleCol}>
                        <View style={styles.exerciseNameRow}>
                          <Text style={styles.exerciseIndex}>{index + 1}.</Text>
                          <Text style={styles.exerciseTitle} numberOfLines={1}>
                            {log.exerciseName}
                          </Text>
                        </View>
                        {log.category && (
                          <Text style={styles.categoryTag}>{log.category.toUpperCase()}</Text>
                        )}
                      </View>
                    </View>

                    <Pressable
                      onPress={() => handleDeleteExercise(log.id, log.exerciseName)}
                      style={styles.deleteExerciseBtn}>
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={17}
                        color={Brand.danger}
                      />
                    </Pressable>
                  </View>

                  {/* Movement Summary Ribbon */}
                  <View style={styles.movementMetaRow}>
                    <Text style={styles.movementVol}>
                      Vol: {Math.round(exVol).toLocaleString()} {log.unit ?? session.unit}
                    </Text>
                    {topSet && topSet.weight && (
                      <Text style={styles.movementTopSet}>
                        Top: {topSet.weight} {log.unit ?? session.unit} × {topSet.reps}
                        {maxRM > 0 ? ` (~${maxRM}${log.unit ?? session.unit} 1RM)` : ''}
                      </Text>
                    )}
                  </View>

                  {/* Sets Table */}
                  <View style={styles.setsTable}>
                    {log.sets.map((set, setIndex) => {
                      const estimatedSet1RM = calculate1RM(set.weight, set.reps);
                      const setType = set.type ?? 'normal';
                      const badgeLabel =
                        setType === 'warmup'
                          ? 'W'
                          : setType === 'dropset'
                          ? 'D'
                          : setType === 'failure'
                          ? 'F'
                          : `${setIndex + 1}`;

                      return (
                        <View key={set.id} style={styles.setRow}>
                          <View style={styles.setRowLeft}>
                            <View style={styles.setNumberBadge}>
                              <Text style={styles.setNumberBadgeText}>{badgeLabel}</Text>
                            </View>
                            <Text style={styles.setPerformance}>
                              {formatSetLine(set.weight, set.reps, set.unit ?? session.unit)}
                            </Text>
                          </View>

                          <View style={styles.setRowRight}>
                            {estimatedSet1RM > 0 && (
                              <Text style={styles.set1RMText}>
                                {estimatedSet1RM} {set.unit ?? session.unit} 1RM
                              </Text>
                            )}

                            {set.weight && parseFloat(set.weight) > 0 ? (
                              <Pressable
                                onPress={() => setPlateCalcWeight(set.weight)}
                                style={styles.plateIconBtn}>
                                <MaterialCommunityIcons
                                  name="weight-lifter"
                                  size={15}
                                  color={Brand.emerald}
                                />
                              </Pressable>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Notes callout */}
                  {log.note ? (
                    <View style={styles.noteBox}>
                      <MaterialCommunityIcons
                        name="note-text-outline"
                        size={14}
                        color={Brand.textMuted}
                      />
                      <Text style={styles.noteText}>{log.note}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Plate Calculator Modal */}
        {plateCalcWeight && (
          <PlateCalculatorModal
            visible={!!plateCalcWeight}
            initialWeight={plateCalcWeight}
            unit={session.unit}
            onClose={() => setPlateCalcWeight(null)}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
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
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.one,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Brand.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  heroCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  splitBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  splitBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  dateLabel: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  repeatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Brand.emerald,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
  },
  repeatBtnText: {
    color: '#050507',
    fontSize: 14,
    fontWeight: '800',
  },
  analyticsRibbon: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: Brand.card,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: 2,
  },
  metricLabel: {
    color: Brand.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  metricUnit: {
    color: Brand.emerald,
    fontSize: 11,
  },
  movementsSection: {
    gap: Spacing.three,
  },
  sectionHeading: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  exerciseCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
  exerciseTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  categoryTag: {
    color: Brand.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  deleteExerciseBtn: {
    padding: 6,
    borderRadius: Radius.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  movementMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  movementVol: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  movementTopSet: {
    color: Brand.emerald,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  setsTable: {
    gap: 6,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  setRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  setNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  setPerformance: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  setRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  set1RMText: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  plateIconBtn: {
    padding: 4,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.sm,
    padding: Spacing.two,
  },
  noteText: {
    color: Brand.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  notFoundTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  notFoundMessage: {
    color: Brand.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 240,
  },
  backLink: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    marginTop: Spacing.two,
  },
  backLinkText: {
    color: '#050507',
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
});
