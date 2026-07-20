import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, ScreenHeader, TextField } from '@/components/ui/form';
import { ThemedView } from '@/components/themed-view';
import { WorkoutLogCard } from '@/components/workout-log-card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';

export default function HistoryScreen() {
  const { isReady, logs } = useWorkoutStore();
  const [filter, setFilter] = useState('');

  const filteredLogs = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return logs;
    return logs.filter((log) => log.exerciseName.toLowerCase().includes(query));
  }, [filter, logs]);

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
        <View style={styles.content}>
          <ScreenHeader title="History" subtitle="Your past workout logs" />

          <TextField
            label="Filter by exercise"
            value={filter}
            onChangeText={setFilter}
            placeholder="Search exercises..."
          />

          <FlatList
            data={filteredLogs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                title={filter ? 'No matching logs' : 'No history yet'}
                message={
                  filter
                    ? 'Try a different exercise name.'
                    : 'Workouts you log will appear here.'
                }
              />
            }
            renderItem={({ item }) => (
              <ThemedView type="backgroundElement" style={styles.cardWrap}>
                <WorkoutLogCard log={item} onPress={() => router.push(`/history/${item.id}`)} />
              </ThemedView>
            )}
          />
        </View>
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
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    flexGrow: 1,
  },
  cardWrap: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
});
