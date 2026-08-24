import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VolumeChart } from '@/components/analytics/volume-chart';
import { GradientButton } from '@/components/ui';
import { RecentSessionCard, WeeklyScheduleStrip } from '@/components/schedule';
import { Brand, BottomTabInset, Radius, Spacing, getSplitBadgeColor } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { formatHeaderDate, getTodayDayOfWeek } from '@/lib/utils';
import { groupLogsIntoSessions } from '@/lib/workout-sessions';

export default function HomeScreen() {
  const {
    isReady,
    hasOnboarded,
    schedule,
    logs,
    stats,
    frequency,
    unitPreference,
    activeSession,
  } = useWorkoutStore();
  const today = getTodayDayOfWeek();
  const todaySchedule = schedule.find((entry) => entry.day === today);
  const todayLabel = todaySchedule?.label ?? 'Rest';
  const isRest = todayLabel.toLowerCase() === 'rest';
  const splitColor = getSplitBadgeColor(todayLabel);

  // Active workout timer
  const [elapsedText, setElapsedText] = useState('');
  useEffect(() => {
    if (!activeSession) return;
    const update = () => {
      const secs = Math.max(0, Math.floor((Date.now() - activeSession.startTimestamp) / 1000));
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      setElapsedText(`${m}:${s < 10 ? '0' : ''}${s}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const recentSessions = useMemo(
    () => groupLogsIntoSessions(logs, schedule, unitPreference).slice(0, 5),
    [logs, schedule, unitPreference],
  );

  useEffect(() => {
    if (isReady && !hasOnboarded) {
      router.replace('/welcome' as any);
    }
  }, [hasOnboarded, isReady]);

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Brand.emerald} />
      </View>
    );
  }

  const targetWorkouts = frequency ?? 3;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.header}>
            <View>
              <Text style={styles.dateText}>{formatHeaderDate()}</Text>
              <Text style={styles.headline}>RepLog</Text>
            </View>

            <Pressable
              onPress={() => router.push(`/log?title=${encodeURIComponent(todayLabel)}`)}
              style={({ pressed }) => [styles.quickLogBtn, pressed && styles.pressed]}>
              <MaterialCommunityIcons
                name={activeSession ? 'play-circle' : 'plus'}
                size={18}
                color="#050507"
              />
              <Text style={styles.quickLogText}>
                {activeSession ? 'Resume Workout' : 'Start Workout'}
              </Text>
            </Pressable>
          </View>

          {/* Active Workout in Progress Banner */}
          {activeSession && (
            <Pressable
              onPress={() => router.push('/log')}
              style={({ pressed }) => [styles.activeSessionBanner, pressed && styles.pressed]}>
              <View style={styles.activeBannerLeft}>
                <View style={styles.activePulseDot} />
                <View>
                  <Text style={styles.activeBannerTitle}>WORKOUT IN PROGRESS</Text>
                  <Text style={styles.activeBannerSubtitle}>
                    {activeSession.title} · {activeSession.exercises.length}{' '}
                    {activeSession.exercises.length === 1 ? 'Exercise' : 'Exercises'}
                  </Text>
                </View>
              </View>

              <View style={styles.activeBannerRight}>
                <Text style={styles.activeTimerText}>{elapsedText}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={Brand.emerald} />
              </View>
            </Pressable>
          )}

          {/* Today's Focus Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroTagRow}>
                <View
                  style={[
                    styles.splitBadge,
                    { backgroundColor: splitColor.bg, borderColor: splitColor.border },
                  ]}>
                  <Text style={[styles.splitBadgeText, { color: splitColor.text }]}>
                    {todayLabel.toUpperCase()} DAY
                  </Text>
                </View>
                {isRest && <Text style={styles.restTag}>Active Recovery</Text>}
              </View>

              <Text style={styles.heroSubtitle}>
                {isRest
                  ? 'Scheduled rest day. Prioritize nutrition & sleep.'
                  : 'Time to track your multi-exercise session and progressive overload.'}
              </Text>
            </View>

            <GradientButton
              label={
                activeSession
                  ? 'Resume Active Workout'
                  : isRest
                  ? 'Log Workout Anyway'
                  : `Start ${todayLabel} Workout`
              }
              icon={<MaterialCommunityIcons name="dumbbell" size={18} color="#050507" />}
              onPress={() => router.push(`/log?title=${encodeURIComponent(todayLabel)}`)}
              compact
            />
          </View>

          {/* Performance & Compliance Strip */}
          <View style={styles.statsStrip}>
            {/* Metric 1: Weekly Goal */}
            <View style={styles.statCard}>
              <View style={styles.statIconBadge}>
                <MaterialCommunityIcons name="target" size={14} color={Brand.emerald} />
              </View>
              <Text style={styles.statValue}>
                {stats.thisWeekWorkouts}
                <Text style={styles.statSub}>/{targetWorkouts}</Text>
              </Text>
              <Text style={styles.statTitle}>Week Target</Text>
            </View>

            {/* Metric 2: Total Sets */}
            <View style={styles.statCard}>
              <View style={styles.statIconBadge}>
                <MaterialCommunityIcons name="repeat" size={14} color={Brand.textSecondary} />
              </View>
              <Text style={styles.statValue}>{stats.totalSets}</Text>
              <Text style={styles.statTitle}>Total Sets</Text>
            </View>

            {/* Metric 3: Volume */}
            <View style={styles.statCard}>
              <View style={styles.statIconBadge}>
                <MaterialCommunityIcons name="weight-kilogram" size={14} color={Brand.textSecondary} />
              </View>
              <Text style={styles.statValue}>
                {stats.totalVolume > 9999
                  ? `${(stats.totalVolume / 1000).toFixed(1)}k`
                  : stats.totalVolume.toLocaleString()}
              </Text>
              <Text style={styles.statTitle}>Vol ({unitPreference})</Text>
            </View>
          </View>

          {/* 7-Day Volume Progression Bar Chart */}
          <VolumeChart logs={logs} unit={unitPreference} />

          {/* 7-Day Split Strip */}
          <WeeklyScheduleStrip schedule={schedule} activeDay={today} />

          {/* Recent Workouts Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>RECENT WORKOUT SESSIONS</Text>
              {recentSessions.length > 0 && (
                <Pressable onPress={() => router.push('/(tabs)/history')}>
                  <Text style={styles.seeAllText}>View All ({logs.length})</Text>
                </Pressable>
              )}
            </View>

            {recentSessions.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={36}
                  color={Brand.textMuted}
                />
                <Text style={styles.emptyTitle}>No workouts logged yet</Text>
                <Text style={styles.emptyMessage}>
                  Tap &quot;Start Workout&quot; above to log your multi-exercise session.
                </Text>
              </View>
            ) : (
              recentSessions.map((session) => (
                <RecentSessionCard
                  key={session.dateKey}
                  title={session.title}
                  subtitle={session.dateLabel}
                  exerciseCount={session.exerciseCount}
                  totalSets={session.totalSets}
                  totalVolume={session.totalVolume}
                  unit={session.unit}
                  onPress={() => router.push(`/workout/${session.dateKey}` as any)}
                />
              ))
            )}
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  quickLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Brand.emerald,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  quickLogText: {
    color: '#050507',
    fontSize: 13,
    fontWeight: '800',
  },
  activeSessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  activeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  activePulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Brand.emerald,
  },
  activeBannerTitle: {
    color: Brand.emerald,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  activeBannerSubtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  activeBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeTimerText: {
    color: Brand.emerald,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  heroCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
  },
  heroHeader: {
    gap: Spacing.two,
  },
  heroTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  splitBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  splitBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  restTag: {
    color: Brand.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  heroSubtitle: {
    color: Brand.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  statsStrip: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    backgroundColor: Brand.card,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: 2,
  },
  statIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Brand.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statSub: {
    color: Brand.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  statTitle: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  seeAllText: {
    color: Brand.emerald,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyMessage: {
    color: Brand.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 240,
  },
  pressed: {
    opacity: 0.8,
  },
});
