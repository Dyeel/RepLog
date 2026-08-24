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
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecentSessionCard } from '@/components/schedule';
import { AnimatedTabScreen } from '@/components/ui';
import { BottomTabInset, Brand, Radius, Shadows, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { useTheme } from '@/hooks/use-theme';
import { groupLogsIntoSessions } from '@/lib/workout-sessions';

export default function HistoryScreen() {
  const { isReady, logs, schedule, unitPreference, deleteSessionByDate } = useWorkoutStore();
  const theme = useTheme();
  const [filter, setFilter] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <AnimatedTabScreen>
          <View style={styles.content}>
            {/* Header with Activity Summary */}
            <View style={styles.header}>
              <View>
                <Text style={styles.sectionTag}>ACTIVITY LOG</Text>
                <Text style={styles.title}>History</Text>
                <Text style={styles.subtitle}>
                  {sessions.length} {sessions.length === 1 ? 'workout session' : 'workout sessions'} recorded
                </Text>
              </View>
            </View>

            {/* Elevated Search Box */}
            <View
              style={[
                styles.searchBox,
                isFocused && [styles.searchBoxFocused, { borderColor: theme.accent }],
              ]}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={isFocused ? theme.accent : Brand.textMuted}
              />
              <TextInput
                value={filter}
                onChangeText={setFilter}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search exercise, muscle group, or split..."
                placeholderTextColor={Brand.textMuted}
                style={styles.searchInput}
              />
              {filter ? (
                <Pressable onPress={() => setFilter('')} style={styles.clearBtn}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={Brand.textMuted} />
                </Pressable>
              ) : null}
            </View>

            {/* Workout Sessions List */}
            <FlatList
              data={sessions}
              keyExtractor={(item) => item.dateKey}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyCard}>
                  <View
                    style={[
                      styles.emptyIconCircle,
                      { backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` },
                    ]}>
                    <MaterialCommunityIcons name="history" size={32} color={theme.accent} />
                  </View>
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
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    gap: 2,
    paddingTop: Spacing.two,
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
    fontWeight: '500',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.three,
    height: 48,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.two,
    ...Shadows.card,
  },
  searchBoxFocused: {
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    borderRadius: Radius.xl,
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.two,
    marginTop: Spacing.four,
    ...Shadows.card,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
