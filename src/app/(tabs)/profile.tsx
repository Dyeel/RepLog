import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
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

import {
  BodyweightChart,
  LogWeightModal,
  StrengthProgressionChart,
} from '@/components/analytics';
import {
  AnimatedTabScreen,
  ThemeCustomizerModal,
} from '@/components/ui';
import { BottomTabInset, Brand, Radius, Spacing, THEME_PALETTES } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { useTheme } from '@/hooks/use-theme';
import { formatDateTime } from '@/lib/utils';
import { ThemeId, WeightUnit, WorkoutFrequency } from '@/types';

const FREQUENCIES: WorkoutFrequency[] = [2, 3, 4, 5, 6];
const THEMES_LIST = Object.values(THEME_PALETTES);

export default function ProfileScreen() {
  const {
    isReady,
    bodyWeightLogs,
    logs,
    sessions,
    stats,
    frequency,
    unitPreference,
    themeId,
    setThemeId,
    setUnitPreference,
    setFrequency,
    deleteBodyWeightLog,
  } = useWorkoutStore();

  const theme = useTheme();
  const [isLogWeightVisible, setIsLogWeightVisible] = useState(false);
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);

  const totalSessionsCount = useMemo(() => {
    return sessions.length || stats.totalSessions || 0;
  }, [sessions, stats]);

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  const handleDeleteEntry = (id: string, weight: number) => {
    Alert.alert(
      'Delete Weight Entry?',
      `Are you sure you want to remove the ${weight} ${unitPreference} entry?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBodyWeightLog(id),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <AnimatedTabScreen>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* 1. Athlete Profile Card */}
            <View style={styles.profileHeroCard}>
              <View style={styles.profileHeaderRow}>
                <View style={[styles.avatarCircle, { borderColor: theme.accent, backgroundColor: `${theme.accent}15` }]}>
                  <MaterialCommunityIcons name="arm-flex" size={28} color={theme.accent} />
                </View>

                <View style={styles.profileTitleCol}>
                  <View style={styles.athleteBadgeRow}>
                    <Text style={styles.athleteName}>Athlete Profile</Text>
                    <View style={[styles.proBadge, { backgroundColor: `${theme.accent}20`, borderColor: theme.accent }]}>
                      <Text style={[styles.proBadgeText, { color: theme.accent }]}>ACTIVE</Text>
                    </View>
                  </View>
                  <Text style={styles.athleteSub}>Progress Tracking & App Settings</Text>
                </View>
              </View>

              {/* Lifetime Stats Strip */}
              <View style={styles.statsStrip}>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: theme.accent }]}>{totalSessionsCount}</Text>
                  <Text style={styles.statLabel}>Workouts</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.totalSets}</Text>
                  <Text style={styles.statLabel}>Total Sets</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {stats.totalVolume > 9999
                      ? `${(stats.totalVolume / 1000).toFixed(1)}k`
                      : stats.totalVolume.toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Volume ({unitPreference})</Text>
                </View>
              </View>
            </View>

            {/* 2. Theme & Visual Style Studio */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons name="palette-outline" size={18} color={theme.accent} />
                  <Text style={styles.sectionCardTitle}>THEME & APPEARANCE</Text>
                </View>
                <Pressable onPress={() => setIsThemeModalVisible(true)}>
                  <Text style={[styles.seeAllText, { color: theme.accent }]}>More Themes</Text>
                </Pressable>
              </View>

              <Text style={styles.sectionHelper}>
                Select an accent color palette to customize your RepLog experience.
              </Text>

              {/* Quick Horizontal Theme Swatch Grid */}
              <View style={styles.themesGrid}>
                {THEMES_LIST.map((item) => {
                  const isSelected = themeId === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setThemeId(item.id)}
                      style={({ pressed }) => [
                        styles.themePill,
                        { borderColor: isSelected ? item.accent : Brand.cardBorder },
                        isSelected && { backgroundColor: `${item.accent}15` },
                        pressed && styles.pressed,
                      ]}>
                      <View style={[styles.themeDot, { backgroundColor: item.accent }]} />
                      <Text
                        style={[
                          styles.themePillName,
                          isSelected && { color: item.accent, fontWeight: '800' },
                        ]}>
                        {item.name.split(' ')[1] || item.name}
                      </Text>
                      {isSelected && (
                        <MaterialCommunityIcons name="check" size={13} color={item.accent} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 3. Training Preferences (Units & Target) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons name="cog-outline" size={18} color={theme.accent} />
                  <Text style={styles.sectionCardTitle}>TRAINING PREFERENCES</Text>
                </View>
              </View>

              {/* Unit Switcher */}
              <View style={styles.prefRow}>
                <View style={styles.prefLeft}>
                  <Text style={styles.prefTitle}>Weight Unit</Text>
                  <Text style={styles.prefSubtitle}>Used for logging & 1RM max calculations</Text>
                </View>
                <View style={styles.unitToggleRow}>
                  {(['kg', 'lbs'] as WeightUnit[]).map((u) => {
                    const isSelected = unitPreference === u;
                    return (
                      <Pressable
                        key={u}
                        onPress={() => setUnitPreference(u)}
                        style={({ pressed }) => [
                          styles.unitChoiceBtn,
                          isSelected && [styles.unitChoiceBtnSelected, { backgroundColor: theme.accent }],
                          pressed && styles.pressed,
                        ]}>
                        <Text
                          style={[
                            styles.unitChoiceText,
                            isSelected && styles.unitChoiceTextSelected,
                          ]}>
                          {u.toUpperCase()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Frequency Selector */}
              <View style={styles.prefRow}>
                <View style={styles.prefLeft}>
                  <Text style={styles.prefTitle}>Weekly Target Days</Text>
                  <Text style={styles.prefSubtitle}>Goal frequency per 7-day training block</Text>
                </View>
                <View style={styles.freqToggleRow}>
                  {FREQUENCIES.map((f) => {
                    const isSelected = frequency === f;
                    return (
                      <Pressable
                        key={f}
                        onPress={() => setFrequency(f)}
                        style={({ pressed }) => [
                          styles.freqBtn,
                          isSelected && [styles.freqBtnSelected, { backgroundColor: theme.accent, borderColor: theme.accent }],
                          pressed && styles.pressed,
                        ]}>
                        <Text
                          style={[
                            styles.freqBtnText,
                            isSelected && styles.freqBtnTextSelected,
                          ]}>
                          {f}D
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* 4. Body & Strength Progression Section */}
            <View style={styles.progressHeaderRow}>
              <View>
                <Text style={styles.sectionTag}>BODY & OVERLOAD ANALYTICS</Text>
                <Text style={styles.headline}>Progression</Text>
              </View>

              <Pressable
                onPress={() => setIsLogWeightVisible(true)}
                style={({ pressed }) => [styles.addLogBtn, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
                <MaterialCommunityIcons name="scale-bathroom" size={16} color="#050507" />
                <Text style={styles.addLogBtnText}>Log Weigh-In</Text>
              </Pressable>
            </View>

            {/* Bodyweight Trend SVG Chart */}
            <BodyweightChart
              logs={bodyWeightLogs}
              unit={unitPreference}
              onOpenLogModal={() => setIsLogWeightVisible(true)}
            />

            {/* Strength Progression Curve Chart */}
            <StrengthProgressionChart logs={logs} unit={unitPreference} />

            {/* Scale Weigh-in History Log */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <Text style={styles.sectionCardTitle}>SCALE WEIGH-IN HISTORY</Text>
                <Text style={styles.historyCount}>{bodyWeightLogs.length} entries</Text>
              </View>

              {bodyWeightLogs.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Text style={styles.emptyHistoryText}>No weigh-in logs recorded yet.</Text>
                  <Text style={styles.emptyHistorySub}>
                    Tap &quot;Log Weigh-In&quot; above to begin tracking your weight trend.
                  </Text>
                </View>
              ) : (
                <View style={styles.historyList}>
                  {bodyWeightLogs.slice(0, 10).map((entry) => (
                    <View key={entry.id} style={styles.historyRow}>
                      <View style={styles.historyLeft}>
                        <View style={styles.weightNumberRow}>
                          <Text style={styles.historyWeight}>{entry.weight}</Text>
                          <Text style={styles.historyUnit}>{entry.unit}</Text>
                        </View>
                        <Text style={styles.historyDate}>{formatDateTime(entry.timestamp)}</Text>
                        {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
                      </View>

                      <Pressable
                        onPress={() => handleDeleteEntry(entry.id, entry.weight)}
                        style={styles.deleteBtn}>
                        <MaterialCommunityIcons
                          name="trash-can-outline"
                          size={16}
                          color={Brand.danger}
                        />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        </AnimatedTabScreen>

        {/* Log Weight Modal Sheet */}
        <LogWeightModal
          visible={isLogWeightVisible}
          unit={unitPreference}
          onClose={() => setIsLogWeightVisible(false)}
        />

        {/* Theme Customizer Studio Sheet */}
        <ThemeCustomizerModal
          visible={isThemeModalVisible}
          onClose={() => setIsThemeModalVisible(false)}
        />
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
  profileHeroCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.four,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitleCol: {
    flex: 1,
    gap: 2,
  },
  athleteBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  athleteName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  proBadge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  athleteSub: {
    color: Brand.textSecondary,
    fontSize: 12,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  sectionCardTitle: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHelper: {
    color: Brand.textSecondary,
    fontSize: 12,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
  },
  themeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  themePillName: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  prefRow: {
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  prefLeft: {
    gap: 2,
  },
  prefTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  prefSubtitle: {
    color: Brand.textMuted,
    fontSize: 11,
  },
  unitToggleRow: {
    flexDirection: 'row',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    width: 120,
  },
  unitChoiceBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: Radius.pill,
  },
  unitChoiceBtnSelected: {
    backgroundColor: Brand.emerald,
  },
  unitChoiceText: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  unitChoiceTextSelected: {
    color: '#050507',
    fontWeight: '800',
  },
  freqToggleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  freqBtn: {
    flex: 1,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  freqBtnSelected: {
    backgroundColor: Brand.emerald,
    borderColor: Brand.emerald,
  },
  freqBtnText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  freqBtnTextSelected: {
    color: '#050507',
    fontWeight: '800',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: Spacing.two,
  },
  sectionTag: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  addLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
  },
  addLogBtnText: {
    color: '#050507',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyHistory: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    padding: Spacing.four,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: 4,
  },
  emptyHistoryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyHistorySub: {
    color: Brand.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  historyList: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  historyLeft: {
    gap: 2,
    flex: 1,
  },
  weightNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  historyWeight: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  historyUnit: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  historyDate: {
    color: Brand.textSecondary,
    fontSize: 11,
  },
  historyNote: {
    color: Brand.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  historyCount: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
});
