import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, PrimaryButton, ScreenHeader } from '@/components/ui/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WorkoutLogCard } from '@/components/workout-log-card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { getTodayDayOfWeek, isRestDay } from '@/lib/utils';
import { DAY_LABELS } from '@/types';

export default function TodayScreen() {
  const { isReady, schedule, logs } = useWorkoutStore();
  const today = getTodayDayOfWeek();
  const todaySchedule = schedule.find((entry) => entry.day === today);
  const todayLabel = todaySchedule?.label ?? 'Rest';
  const resting = isRestDay(todayLabel);

  const recentLogs = useMemo(() => logs.slice(0, 3), [logs]);

  if (!isReady) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title="RepLog" subtitle={`${DAY_LABELS[today]} · ${new Date().toLocaleDateString()}`} />

          <ThemedView type="backgroundElement" style={styles.todayCard}>
            <ThemedText type="small" themeColor="textSecondary">
              Today
            </ThemedText>
            <ThemedText type="subtitle" style={styles.todayLabel}>
              {todayLabel}
            </ThemedText>
            {resting ? (
              <ThemedText type="small" themeColor="textSecondary">
                Rest day — recover and come back stronger.
              </ThemedText>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                You&apos;re scheduled for {todayLabel.toLowerCase()} today.
              </ThemedText>
            )}
            <PrimaryButton label="Log Workout" onPress={() => router.push('/log')} />
          </ThemedView>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="smallBold">Recent Logs</ThemedText>
              {logs.length > 0 ? (
                <Pressable onPress={() => router.push('/history')}>
                  <ThemedText type="linkPrimary">See all</ThemedText>
                </Pressable>
              ) : null}
            </View>

            {recentLogs.length === 0 ? (
              <EmptyState
                title="No workouts yet"
                message="Log your first exercise to start tracking progress."
              />
            ) : (
              recentLogs.map((log) => (
                <ThemedView key={log.id} type="backgroundElement" style={styles.logCardWrap}>
                  <WorkoutLogCard log={log} onPress={() => router.push(`/history/${log.id}`)} />
                </ThemedView>
              ))
            )}
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
  todayCard: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  todayLabel: {
    fontSize: 36,
    lineHeight: 42,
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logCardWrap: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
});
