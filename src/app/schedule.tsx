import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ui/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { getDefaultSplit } from '@/lib/defaults';
import { useTheme } from '@/hooks/use-theme';
import { DAY_LABELS, DAYS_OF_WEEK, WORKOUT_LABELS, WorkoutFrequency } from '@/types';

const FREQUENCIES: WorkoutFrequency[] = [2, 3, 4];

export default function ScheduleScreen() {
  const theme = useTheme();
  const { isReady, frequency, schedule, setFrequency, updateScheduleDay } = useWorkoutStore();
  const [editingDay, setEditingDay] = useState<(typeof DAYS_OF_WEEK)[number] | null>(null);

  const handleFrequencyChange = (next: WorkoutFrequency) => {
    if (next === frequency) return;

    Alert.alert(
      'Change frequency?',
      `This will reset your schedule to the default ${next}x/week split.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset schedule',
          style: 'destructive',
          onPress: () => setFrequency(next),
        },
      ],
    );
  };

  if (!isReady) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  const defaultSplit = getDefaultSplit(frequency);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title="Schedule" subtitle="Plan your weekly training split" />

          <View style={styles.section}>
            <ThemedText type="smallBold">Workouts per week</ThemedText>
            <View style={styles.frequencyRow}>
              {FREQUENCIES.map((option) => {
                const selected = frequency === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => handleFrequencyChange(option)}
                    style={({ pressed }) => [
                      styles.frequencyButton,
                      { backgroundColor: theme.backgroundElement },
                      selected && styles.frequencyButtonSelected,
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={selected ? styles.selectedFrequencyText : undefined}
                      themeColor={selected ? undefined : 'textSecondary'}>
                      {option}x
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              Default split:{' '}
              {Object.entries(defaultSplit)
                .filter(([, label]) => label !== 'Rest')
                .map(([day, label]) => `${DAY_LABELS[day as keyof typeof DAY_LABELS].slice(0, 3)} ${label}`)
                .join(' · ')}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold">Weekly plan</ThemedText>
            {DAYS_OF_WEEK.map((day) => {
              const entry = schedule.find((item) => item.day === day);
              const label = entry?.label ?? 'Rest';
              const isEditing = editingDay === day;

              return (
                <ThemedView key={day} type="backgroundElement" style={styles.dayCard}>
                  <View style={styles.dayHeader}>
                    <ThemedText type="smallBold">{DAY_LABELS[day]}</ThemedText>
                    {!isEditing ? (
                      <Pressable onPress={() => setEditingDay(day)}>
                        <ThemedText type="linkPrimary">{label}</ThemedText>
                      </Pressable>
                    ) : null}
                  </View>

                  {isEditing ? (
                    <View style={styles.labelPicker}>
                      {WORKOUT_LABELS.map((option) => (
                        <Pressable
                          key={option}
                          onPress={() => {
                            updateScheduleDay(day, option);
                            setEditingDay(null);
                          }}
                          style={({ pressed }) => [
                            styles.labelOption,
                            { backgroundColor: theme.backgroundSelected },
                            label === option && styles.labelOptionSelected,
                            pressed && styles.pressed,
                          ]}>
                          <ThemedText
                            type="small"
                            themeColor={label === option ? 'text' : 'textSecondary'}>
                            {option}
                          </ThemedText>
                        </Pressable>
                      ))}
                      <Pressable onPress={() => setEditingDay(null)}>
                        <ThemedText type="small" themeColor="textSecondary">
                          Done
                        </ThemedText>
                      </Pressable>
                    </View>
                  ) : null}
                </ThemedView>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    gap: Spacing.two,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  frequencyButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  frequencyButtonSelected: {
    backgroundColor: '#3c87f7',
  },
  selectedFrequencyText: {
    color: '#ffffff',
  },
  dayCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    alignItems: 'center',
  },
  labelOption: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
  labelOptionSelected: {
    backgroundColor: '#3c87f7',
  },
  pressed: {
    opacity: 0.85,
  },
});
