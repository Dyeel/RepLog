import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecentSessionCard } from '@/components/schedule';
import { Brand, BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { groupLogsIntoSessions } from '@/lib/workout-sessions';

export default function HistoryScreen() {
  const { isReady, logs, schedule, unitPreference, deleteSessionByDate } = useWorkoutStore();
  const [filter, setFilter] = useState('');

  const sessions = useMemo(() => {
    const all = groupLogsIntoSessions(logs, schedule, unitPreference);
    const query = filter.trim().toLowerCase();
    if (!query) return all;
    return all.filter(
      (session) =>
        session.title.toLowerCase().includes(query) ||
        session.logs.some((log) => log.exerciseName.toLowerCase().includes(query)),
    );
  }, [filter, logs, schedule, unitPreference]);

  const handleDeleteSession = (dateKey: string, title: string, dateLabel: string) => {
    Alert.alert(
      'Delete Workout?',
      `Are you sure you want to delete ${title} on ${dateLabel}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSessionByDate(dateKey);
          },
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <View>
              <Text style={styles.title}>History</Text>
              <Text style={styles.subtitle}>
                {sessions.length} {sessions.length === 1 ? 'workout session' : 'workout sessions'} logged
              </Text>
            </View>
          </Animated.View>

          {/* Search Box */}
          <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color={Brand.textMuted} />
            <TextInput
              value={filter}
              onChangeText={setFilter}
              placeholder="Search movement or split..."
              placeholderTextColor={Brand.textMuted}
              style={styles.searchInput}
            />
            {filter ? (
              <Pressable onPress={() => setFilter('')} style={styles.clearBtn}>
                <MaterialCommunityIcons name="close-circle" size={18} color={Brand.textMuted} />
              </Pressable>
            ) : null}
          </Animated.View>

          {/* Workout Sessions List */}
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.dateKey}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="history"
                  size={44}
                  color={Brand.textMuted}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>
                  {filter ? 'No matching workouts' : 'No history yet'}
                </Text>
                <Text style={styles.emptyMessage}>
                  {filter
                    ? `No workouts found matching "${filter}".`
                    : 'Workouts you log will appear here grouped by session date.'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <RecentSessionCard
                title={item.title}
                subtitle={item.dateLabel}
                exerciseCount={item.exerciseCount}
                totalSets={item.totalSets}
                totalVolume={item.totalVolume}
                unit={item.unit}
                onPress={() => router.push(`/workout/${item.dateKey}` as any)}
                onDelete={() => handleDeleteSession(item.dateKey, item.title, item.dateLabel)}
              />
            )}
          />
        </View>
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
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    gap: 4,
    paddingTop: Spacing.two,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Brand.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 48,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.four,
    flexGrow: 1,
  },
  emptyCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  emptyIcon: {
    marginBottom: Spacing.one,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  emptyMessage: {
    color: Brand.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
});
