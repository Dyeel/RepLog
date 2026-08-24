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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeeklyScheduleStrip } from '@/components/schedule';
import { Brand, BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { getDefaultSplit } from '@/lib/defaults';
import { getTodayDayOfWeek } from '@/lib/utils';
import { DAY_LABELS, DAYS_OF_WEEK, WORKOUT_LABELS, WorkoutFrequency } from '@/types';

const FREQUENCIES: WorkoutFrequency[] = [2, 3, 4, 5, 6];

export default function ScheduleScreen() {
  const { isReady, frequency, schedule, setFrequency, updateScheduleDay } = useWorkoutStore();
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
        <ActivityIndicator color={Brand.emerald} />
      </View>
    );
  }

  const defaultSplit = getDefaultSplit(frequency);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <Text style={styles.title}>Split Architecture</Text>
            <Text style={styles.subtitle}>Customize weekly training allocation</Text>
          </Animated.View>

          {/* 7-Day Visual Strip */}
          <Animated.View entering={FadeInDown.delay(100).duration(450)}>
            <WeeklyScheduleStrip schedule={schedule} activeDay={today} />
          </Animated.View>

          {/* Frequency Selector */}
          <Animated.View entering={FadeInDown.delay(200).duration(450)} style={styles.section}>
            <Text style={styles.sectionLabel}>TRAINING FREQUENCY</Text>
            <View style={styles.frequencyRow}>
              {FREQUENCIES.map((option) => {
                const selected = frequency === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => handleFrequencyChange(option)}
                    style={({ pressed }) => [
                      styles.frequencyButton,
                      selected && styles.frequencyButtonSelected,
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
              <MaterialCommunityIcons name="information-outline" size={15} color={Brand.textMuted} />
              <Text style={styles.helper}>
                {Object.entries(defaultSplit)
                  .filter(([, label]) => label !== 'Rest')
                  .map(([day, label]) => `${DAY_LABELS[day as keyof typeof DAY_LABELS].slice(0, 3)}: ${label}`)
                  .join(' · ')}
              </Text>
            </View>
          </Animated.View>

          {/* Day-by-Day Editor */}
          <Animated.View entering={FadeInDown.delay(300).duration(450)} style={styles.section}>
            <Text style={styles.sectionLabel}>CUSTOMIZE SCHEDULE</Text>

            <View style={styles.daysList}>
              {DAYS_OF_WEEK.map((day) => {
                const entry = schedule.find((item) => item.day === day);
                const label = entry?.label ?? 'Rest';
                const isEditing = editingDay === day;
                const isToday = day === today;
                const isRest = label.toLowerCase() === 'rest';

                return (
                  <View key={day} style={[styles.dayCard, isToday && styles.dayCardToday]}>
                    <View style={styles.dayHeader}>
                      <View style={styles.dayTitleRow}>
                        <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                          {DAY_LABELS[day]}
                        </Text>
                        {isToday && <Text style={styles.todayIndicator}>TODAY</Text>}
                      </View>

                      <Pressable
                        onPress={() => setEditingDay(isEditing ? null : day)}
                        style={[styles.labelBadge, isRest && styles.labelBadgeRest]}>
                        <Text style={[styles.labelBadgeText, isRest && styles.labelBadgeTextRest]}>
                          {label}
                        </Text>
                        <MaterialCommunityIcons
                          name={isEditing ? 'chevron-up' : 'pencil-outline'}
                          size={14}
                          color={isRest ? Brand.textMuted : '#FFFFFF'}
                        />
                      </Pressable>
                    </View>

                    {/* Tag Options Dropdown */}
                    {isEditing && (
                      <View style={styles.labelPicker}>
                        <Text style={styles.pickerTitle}>Target focus for {DAY_LABELS[day]}:</Text>
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
                                  isSelected && styles.labelOptionActive,
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
          </Animated.View>
        </ScrollView>
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
    gap: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Brand.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    gap: Spacing.two,
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
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  frequencyButtonSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  frequencyText: {
    color: Brand.textSecondary,
    fontSize: 14,
    fontWeight: '800',
  },
  frequencyTextSelected: {
    color: '#050507',
  },
  presetNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  helper: {
    color: Brand.textMuted,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  daysList: {
    gap: Spacing.two,
  },
  dayCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.two,
  },
  dayCardToday: {
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: Brand.cardElevated,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  dayNameToday: {
    color: '#FFFFFF',
  },
  todayIndicator: {
    color: Brand.emerald,
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: Brand.emeraldMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  labelBadgeRest: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  labelBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  labelBadgeTextRest: {
    color: Brand.textMuted,
  },
  labelPicker: {
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    gap: Spacing.two,
  },
  pickerTitle: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  labelOption: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Brand.cardElevated,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  labelOptionActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  labelOptionText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  labelOptionTextActive: {
    color: '#050507',
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
});
