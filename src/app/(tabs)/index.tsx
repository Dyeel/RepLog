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
import {
  AnimatedTabScreen,
  GradientButton,
  PulsingDot,
} from '@/components/ui';
import { RecentSessionCard, WeeklyScheduleStrip } from '@/components/schedule';
import { BottomTabInset, Brand, Radius, Shadows, Spacing, getSplitBadgeColor } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { useTheme } from '@/hooks/use-theme';
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
  const theme = useTheme();
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
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  const targetWorkouts = frequency ?? 3;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <AnimatedTabScreen>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Top Header Row */}
            <View style={styles.header}>
              <View>
                <Text style={styles.dateText}>{formatHeaderDate()}</Text>
                <Text style={styles.headline}>RepLog</Text>
              </View>

              <Pressable
                onPress={() => router.push(`/log?title=${encodeURIComponent(todayLabel)}`)}
                style={({ pressed }) => [
                  styles.quickLogBtn,
                  {
                    backgroundColor: theme.accent,
                    shadowColor: theme.accent,
                  },
                  pressed && styles.pressed,
                ]}>
                <MaterialCommunityIcons
                  name={activeSession ? 'play-circle' : 'plus'}
                  size={18}
                  color="#050507"
                />
                <Text style={styles.quickLogText}>
                  {activeSession ? 'Resume' : 'Quick Log'}
                </Text>
              </Pressable>
            </View>

            {/* Active Workout in Progress Banner */}
            {activeSession && (
              <Pressable
                onPress={() => router.push('/log')}
                style={({ pressed }) => [
                  styles.activeSessionBanner,
                  {
                    borderColor: `${theme.accent}60`,
                    backgroundColor: `${theme.accent}10`,
                    shadowColor: theme.accent,
                  },
                  pressed && styles.pressed,
                ]}>
                <View style={styles.activeBannerLeft}>
                  <PulsingDot size={9} color={theme.accent} />
                  <View style={styles.activeTextCol}>
                    <Text style={[styles.activeBannerTitle, { color: theme.accent }]}>
                      WORKOUT IN PROGRESS
                    </Text>
                    <Text style={styles.activeBannerSubtitle}>
                      {activeSession.title} · {activeSession.exercises.length}{' '}
                      {activeSession.exercises.length === 1 ? 'Exercise' : 'Exercises'}
                    </Text>
                  </View>
                </View>

                <View style={styles.activeBannerRight}>
                  <Text style={[styles.activeTimerText, { color: theme.accent }]}>{elapsedText}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={theme.accent} />
                </View>
              </Pressable>
            )}

            {/* Elevated Hero Workout Card */}
            <View
              style={[
                styles.heroCard,
                {
                  borderColor: isRest ? Brand.cardBorder : `${theme.accent}40`,
                  shadowColor: isRest ? 'transparent' : theme.accent,
                },
              ]}>
              <View style={styles.heroHeader}>
                <View style={styles.heroTagRow}>
                  <View
                    style={[
                      styles.splitBadge,
                      {
                        backgroundColor: isRest ? splitColor.bg : `${theme.accent}20`,
                        borderColor: isRest ? splitColor.border : theme.accent,
                      },
                    ]}>
                    <MaterialCommunityIcons
                      name={isRest ? 'coffee-outline' : 'lightning-bolt'}
                      size={14}
                      color={isRest ? splitColor.text : theme.accent}
                    />
                    <Text
                      style={[
                        styles.splitBadgeText,
                        { color: isRest ? splitColor.text : theme.accent },
                      ]}>
                      {todayLabel.toUpperCase()} DAY
                    </Text>
                  </View>
                  {isRest && <Text style={styles.restTag}>Active Recovery</Text>}
                </View>

                <Text style={styles.heroSubtitle}>
                  {isRest
                    ? 'Scheduled recovery day. Hydrate, optimize protein, and rest muscle fibers.'
                    : 'Time to dominate today’s training block with targeted progressive overload.'}
                </Text>
              </View>

              <GradientButton
                label={
                  activeSession
                    ? 'Resume Active Workout'
                    : isRest
                    ? 'Log Extra Workout'
                    : `Start ${todayLabel} Workout`
                }
                icon={<MaterialCommunityIcons name="dumbbell" size={18} color="#050507" />}
                onPress={() => router.push(`/log?title=${encodeURIComponent(todayLabel)}`)}
                compact
              />
            </View>

            {/* Performance & Compliance KPI Cards (3-Grid with Top-Glow Depth) */}
            <View style={styles.statsStrip}>
              {/* Metric 1: Weekly Target */}
              <View style={[styles.statCard, { borderColor: Brand.cardBorder }]}>
                <View style={[styles.statTopLine, { backgroundColor: theme.accent }]} />
                <View
                  style={[
                    styles.statIconBadge,
                    { backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` },
                  ]}>
                  <MaterialCommunityIcons name="target" size={14} color={theme.accent} />
                </View>
                <Text style={styles.statValue}>
                  {stats.thisWeekWorkouts}
                  <Text style={styles.statSub}>/{targetWorkouts}</Text>
                </Text>
                <Text style={styles.statTitle}>Week Target</Text>
              </View>

              {/* Metric 2: Total Sets */}
              <View style={[styles.statCard, { borderColor: Brand.cardBorder }]}>
                <View style={[styles.statTopLine, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
                <View
                  style={[
                    styles.statIconBadge,
                    { backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: Brand.cardBorder },
                  ]}>
                  <MaterialCommunityIcons name="repeat" size={14} color={Brand.textSecondary} />
                </View>
                <Text style={styles.statValue}>{stats.totalSets}</Text>
                <Text style={styles.statTitle}>Total Sets</Text>
              </View>

              {/* Metric 3: Volume */}
              <View style={[styles.statCard, { borderColor: Brand.cardBorder }]}>
                <View style={[styles.statTopLine, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
                <View
                  style={[
                    styles.statIconBadge,
                    { backgroundColor: 'rgba(255, 255, 255, 0.06)', borderColor: Brand.cardBorder },
                  ]}>
                  <MaterialCommunityIcons
                    name="weight-kilogram"
                    size={14}
                    color={Brand.textSecondary}
                  />
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
                    <Text style={[styles.seeAllText, { color: theme.accent }]}>
                      View All ({logs.length})
                    </Text>
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
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  quickLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickLogText: {
    color: '#050507',
    fontSize: 12,
    fontWeight: '800',
  },
  activeSessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.xl,
    padding: Spacing.three,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  activeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  activeTextCol: {
    gap: 1,
    flex: 1,
  },
  activeBannerTitle: {
    fontSize: 10,
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
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  heroCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1.5,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
    ...Shadows.cardElevated,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  splitBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
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
    borderRadius: Radius.xl,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    gap: 2,
    ...Shadows.card,
  },
  statTopLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
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
