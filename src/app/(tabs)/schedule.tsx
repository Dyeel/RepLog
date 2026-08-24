import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
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

import { WeeklyScheduleStrip } from '@/components/schedule';
import { AnimatedTabScreen } from '@/components/ui';
import { BottomTabInset, Brand, Radius, Shadows, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { useTheme } from '@/hooks/use-theme';
import { getDefaultSplit } from '@/lib/defaults';
import { getTodayDayOfWeek } from '@/lib/utils';
import { DAY_LABELS, DAYS_OF_WEEK, WORKOUT_LABELS, WorkoutFrequency } from '@/types';

const FREQUENCIES: WorkoutFrequency[] = [2, 3, 4, 5, 6];

export default function ScheduleScreen() {
  const { isReady, frequency, schedule, setFrequency, updateScheduleDay } = useWorkoutStore();
  const theme = useTheme();
  const [editingDay, setEditingDay] = useState<(typeof DAYS_OF_WEEK)[number] | null>(null);
  const today = getTodayDayOfWeek();

  const handleFrequencyChange = (next: WorkoutFrequency) => {
    if (next === frequency) return;

    Alert.alert(
      'Reset Routine Split?',
      `Switching to ${next} days/week will apply standard preset splits. Custom days can be edited below.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Apply ${next}x Split`,
          style: 'destructive',
          onPress: () => setFrequency(next),
        },
      ],
    );
  };

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  const defaultSplit = getDefaultSplit(frequency);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <AnimatedTabScreen>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.sectionTag}>ROUTINE ARCHITECTURE</Text>
              <Text style={styles.title}>Schedule</Text>
              <Text style={styles.subtitle}>Customize weekly training allocation & splits</Text>
            </View>

            {/* 7-Day Visual Strip */}
            <WeeklyScheduleStrip schedule={schedule} activeDay={today} />

            {/* Frequency Selector Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <MaterialCommunityIcons name="calendar-sync" size={16} color={theme.accent} />
                <Text style={styles.sectionLabel}>TRAINING FREQUENCY</Text>
              </View>

              <View style={styles.frequencyRow}>
                {FREQUENCIES.map((option) => {
                  const selected = frequency === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => handleFrequencyChange(option)}
                      style={({ pressed }) => [
                        styles.frequencyButton,
                        selected && [
                          styles.frequencyButtonSelected,
                          {
                            backgroundColor: theme.accent,
                            borderColor: theme.accent,
                            shadowColor: theme.accent,
                          },
                        ],
                        pressed && styles.pressed,
                      ]}>
                      <Text
                        style={[
                          styles.frequencyText,
                          selected && styles.frequencyTextSelected,
                        ]}>
                        {option}D
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.presetNotice}>
                <MaterialCommunityIcons name="information-outline" size={14} color={Brand.textMuted} />
                <Text style={styles.helper}>
                  {Object.entries(defaultSplit)
                    .filter(([, label]) => label !== 'Rest')
                    .map(
                      ([day, label]) =>
                        `${DAY_LABELS[day as keyof typeof DAY_LABELS].slice(0, 3)}: ${label}`,
                    )
                    .join(' · ')}
                </Text>
              </View>
            </View>

            {/* Day-by-Day Split Cards */}
            <View style={styles.daysSection}>
              <Text style={styles.sectionLabel}>WEEKLY SPLIT BREAKDOWN</Text>

              <View style={styles.daysList}>
                {DAYS_OF_WEEK.map((day) => {
                  const entry = schedule.find((item) => item.day === day);
                  const label = entry?.label ?? 'Rest';
                  const isEditing = editingDay === day;
                  const isToday = day === today;
                  const isRest = label.toLowerCase() === 'rest';

                  return (
                    <View
                      key={day}
                      style={[
                        styles.dayCard,
                        isToday && [
                          styles.dayCardToday,
                          {
                            borderColor: `${theme.accent}70`,
                            backgroundColor: `${theme.accent}0a`,
                            shadowColor: theme.accent,
                          },
                        ],
                      ]}>
                      {isToday && (
                        <View style={[styles.todayIndicatorBar, { backgroundColor: theme.accent }]} />
                      )}

                      <View style={styles.dayHeader}>
                        <View style={styles.dayTitleRow}>
                          <Text
                            style={[
                              styles.dayName,
                              isToday && { color: theme.accent, fontWeight: '800' },
                            ]}>
                            {DAY_LABELS[day]}
                          </Text>
                          {isToday && (
                            <View style={[styles.todayBadgePill, { backgroundColor: theme.accent }]}>
                              <Text style={styles.todayBadgeText}>TODAY</Text>
                            </View>
                          )}
                        </View>

                        <Pressable
                          onPress={() => setEditingDay(isEditing ? null : day)}
                          style={[
                            styles.labelBadge,
                            isRest ? styles.labelBadgeRest : { borderColor: `${theme.accent}30` },
                            !isRest && { backgroundColor: Brand.cardElevated },
                          ]}>
                          <Text
                            style={[
                              styles.labelBadgeText,
                              isRest && styles.labelBadgeTextRest,
                              !isRest && isToday && { color: '#FFFFFF' },
                            ]}>
                            {label}
                          </Text>
                          <MaterialCommunityIcons
                            name={isEditing ? 'chevron-up' : 'pencil-outline'}
                            size={14}
                            color={isRest ? Brand.textMuted : theme.accent}
                          />
                        </Pressable>
                      </View>

                      {/* Tag Options Dropdown */}
                      {isEditing && (
                        <View style={styles.labelPicker}>
                          <Text style={styles.pickerTitle}>Select focus for {DAY_LABELS[day]}:</Text>
                          <View style={styles.optionsWrap}>
                            {WORKOUT_LABELS.map((option) => {
                              const isSelected = label === option;
                              return (
                                <Pressable
                                  key={option}
                                  onPress={() => {
                                    updateScheduleDay(day, option);
                                    setEditingDay(null);
                                  }}
                                  style={({ pressed }) => [
                                    styles.labelOption,
                                    isSelected && [
                                      styles.labelOptionActive,
                                      {
                                        backgroundColor: theme.accent,
                                        borderColor: theme.accent,
                                      },
                                    ],
                                    pressed && styles.pressed,
                                  ]}>
                                  <Text
                                    style={[
                                      styles.labelOptionText,
                                      isSelected && styles.labelOptionTextActive,
                                    ]}>
                                    {option}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </AnimatedTabScreen>
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
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: 2,
  },
  sectionTag: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Brand.textSecondary,
    fontSize: 13,
  },
  sectionCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
    ...Shadows.card,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  frequencyButtonSelected: {
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  frequencyText: {
    color: Brand.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  frequencyTextSelected: {
    color: '#050507',
    fontWeight: '800',
  },
  presetNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helper: {
    color: Brand.textMuted,
    fontSize: 11,
    flex: 1,
  },
  daysSection: {
    gap: Spacing.two,
  },
  daysList: {
    gap: Spacing.two,
  },
  dayCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    position: 'relative',
    overflow: 'hidden',
    gap: Spacing.two,
    ...Shadows.card,
  },
  todayIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5,
  },
  dayCardToday: {
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dayName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  todayBadgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  todayBadgeText: {
    color: '#050507',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderWidth: 1,
  },
  labelBadgeRest: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  labelBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  labelBadgeTextRest: {
    color: Brand.textMuted,
  },
  labelPicker: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  pickerTitle: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  labelOption: {
    backgroundColor: Brand.card,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  labelOptionActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  labelOptionText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  labelOptionTextActive: {
    color: '#050507',
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
});
