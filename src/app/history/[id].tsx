import { useLocalSearchParams, router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, ScreenHeader } from '@/components/ui/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { formatDateTime } from '@/lib/utils';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isReady, logs } = useWorkoutStore();
  const log = logs.find((entry) => entry.id === id);

  if (!isReady) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!log) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <ScreenHeader title="Not found" subtitle="This workout log no longer exists." />
            <PrimaryButton label="Go back" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title={log.exerciseName} subtitle={formatDateTime(log.timestamp)} />

          <ThemedView type="backgroundElement" style={styles.setsCard}>
            <ThemedText type="smallBold">Sets</ThemedText>
            {log.sets.map((set, index) => (
              <View key={set.id} style={styles.setRow}>
                <ThemedText type="smallBold">Set {index + 1}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {set.weight || '0'} kg × {set.reps || '0'} reps
                </ThemedText>
              </View>
            ))}
          </ThemedView>

          {log.note ? (
            <ThemedView type="backgroundElement" style={styles.noteCard}>
              <ThemedText type="smallBold">Note</ThemedText>
              <ThemedText>{log.note}</ThemedText>
            </ThemedView>
          ) : null}

          <PrimaryButton label="Back to history" onPress={() => router.back()} />
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
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  setsCard: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteCard: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.four,
  },
});
