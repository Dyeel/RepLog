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
import { WeightUnit, WorkoutFrequency } from '@/types';

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
            {/* 1. Athlete Profile Hero Section */}
            <View style={[styles.profileHeroCard, { borderColor: `${theme.accent}30` }]}>
              {/* Top Banner Row */}
              <View style={styles.profileHeaderRow}>
                <View
                  style={[
                    styles.avatarGlowContainer,
                    {
                      borderColor: theme.accent,
                      backgroundColor: `${theme.accent}12`,
                      shadowColor: theme.accent,
                    },
                  ]}>
                  <MaterialCommunityIcons name="shield-account" size={32} color={theme.accent} />
                </View>

                <View style={styles.profileInfoCol}>
                  <View style={styles.nameRow}>
                    <Text style={styles.athleteName}>Athlete Profile</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${theme.accent}20`, borderColor: theme.accent },
                      ]}>
                      <View style={[styles.statusDot, { backgroundColor: theme.accent }]} />
                      <Text style={[styles.statusBadgeText, { color: theme.accent }]}>PRO LIFTER</Text>
                    </View>
                  </View>
                  <Text style={styles.athleteSub}>Consistency & Progressive Overload</Text>
                </View>
              </View>

              {/* High-Contrast Lifetime Performance Matrix (4-Grid) */}
              <View style={styles.matrixContainer}>
                <View style={styles.matrixRow}>
                  <View style={styles.matrixCard}>
                    <View style={styles.matrixCardHeader}>
                      <MaterialCommunityIcons name="dumbbell" size={14} color={theme.accent} />
                      <Text style={styles.matrixLabel}>WORKOUTS</Text>
                    </View>
                    <Text style={[styles.matrixValue, { color: theme.accent }]}>
                      {totalSessionsCount}
                    </Text>
                  </View>

                  <View style={styles.matrixCard}>
                    <View style={styles.matrixCardHeader}>
                      <MaterialCommunityIcons name="repeat" size={14} color={Brand.textSecondary} />
                      <Text style={styles.matrixLabel}>TOTAL SETS</Text>
                    </View>
                    <Text style={styles.matrixValue}>{stats.totalSets}</Text>
                  </View>
                </View>

                <View style={styles.matrixRow}>
                  <View style={styles.matrixCard}>
                    <View style={styles.matrixCardHeader}>
                      <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={14} color={Brand.textSecondary} />
                      <Text style={styles.matrixLabel}>VOLUME ({unitPreference.toUpperCase()})</Text>
                    </View>
                    <Text style={styles.matrixValue}>
                      {stats.totalVolume > 9999
                        ? `${(stats.totalVolume / 1000).toFixed(1)}k`
                        : stats.totalVolume.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.matrixCard}>
                    <View style={styles.matrixCardHeader}>
                      <MaterialCommunityIcons name="calendar-check" size={14} color={theme.accent} />
                      <Text style={styles.matrixLabel}>SPLIT TARGET</Text>
                    </View>
                    <Text style={[styles.matrixValue, { color: theme.accent }]}>
                      {frequency}D / wk
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 2. Progression Section (Placed DIRECTLY below Profile) */}
            <View style={styles.progressionSectionWrapper}>
              <View style={styles.progressHeaderRow}>
                <View>
                  <Text style={styles.sectionTag}>BODY & OVERLOAD ANALYTICS</Text>
                  <Text style={styles.headline}>Progression</Text>
                </View>

                <Pressable
                  onPress={() => setIsLogWeightVisible(true)}
                  style={({ pressed }) => [
                    styles.addLogBtn,
                    { backgroundColor: theme.accent },
                    pressed && styles.pressed,
                  ]}>
                  <MaterialCommunityIcons name="scale-bathroom" size={16} color="#050507" />
                  <Text style={styles.addLogBtnText}>Log Weigh-In</Text>
                </Pressable>
              </View>

              {/* 2.1 Bodyweight Trend SVG Curve Graph */}
              <BodyweightChart
                logs={bodyWeightLogs}
                unit={unitPreference}
                onOpenLogModal={() => setIsLogWeightVisible(true)}
              />

              {/* 2.2 Lift Strength 1RM Progressive Overload Curve */}
              <StrengthProgressionChart logs={logs} unit={unitPreference} />

              {/* 2.3 Scale Weigh-in Log Table */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionCardHeader}>
                  <View style={styles.sectionTitleRow}>
                    <MaterialCommunityIcons name="history" size={16} color={theme.accent} />
                    <Text style={styles.sectionCardTitle}>SCALE WEIGH-IN HISTORY</Text>
                  </View>
                  <Text style={styles.historyCount}>{bodyWeightLogs.length} entries</Text>
                </View>

                {bodyWeightLogs.length === 0 ? (
                  <View style={styles.emptyHistory}>
                    <Text style={styles.emptyHistoryText}>No weigh-in logs recorded yet.</Text>
                    <Text style={styles.emptyHistorySub}>
                      Tap &quot;Log Weigh-In&quot; above to begin charting your bodyweight curve.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.historyList}>
                    {bodyWeightLogs.slice(0, 10).map((entry) => (
                      <View key={entry.id} style={styles.historyRow}>
                        <View style={styles.historyLeft}>
                          <View style={styles.weightNumberRow}>
                            <Text style={styles.historyWeight}>{entry.weight}</Text>
                            <Text style={[styles.historyUnit, { color: theme.accent }]}>
                              {entry.unit}
                            </Text>
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
            </View>

            {/* 3. Theme & Visual Style Studio Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons name="palette-outline" size={18} color={theme.accent} />
                  <Text style={styles.sectionCardTitle}>THEME STUDIO</Text>
                </View>
                <Pressable
                  onPress={() => setIsThemeModalVisible(true)}
                  style={({ pressed }) => [styles.openStudioPill, pressed && styles.pressed]}>
                  <Text style={[styles.seeAllText, { color: theme.accent }]}>Studio Modal ↗</Text>
                </Pressable>
              </View>

              <Text style={styles.sectionHelper}>
                Select an accent color palette to customize all screens, curves, and active buttons.
              </Text>

              {/* Luxury Theme Palette Grid */}
              <View style={styles.themesGrid}>
                {THEMES_LIST.map((item) => {
                  const isSelected = themeId === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setThemeId(item.id)}
                      style={({ pressed }) => [
                        styles.themeCardItem,
                        { borderColor: isSelected ? item.accent : Brand.cardBorder },
                        isSelected && {
                          backgroundColor: `${item.accent}14`,
                          borderColor: item.accent,
                        },
                        pressed && styles.pressed,
                      ]}>
                      <View style={[styles.themeDotBig, { backgroundColor: item.accent }]} />
                      <View style={styles.themeNameCol}>
                        <Text
                          style={[
                            styles.themePillName,
                            isSelected && { color: item.accent, fontWeight: '800' },
                          ]}>
                          {item.name}
                        </Text>
                        <Text style={styles.themeSubText}>{item.subtitle.split('·')[1]?.trim() || item.subtitle}</Text>
                      </View>
                      {isSelected ? (
                        <View style={[styles.checkCircle, { backgroundColor: item.accent }]}>
                          <MaterialCommunityIcons name="check" size={12} color="#050507" />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* 4. Training Preferences & App Settings */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <View style={styles.sectionTitleRow}>
                  <MaterialCommunityIcons name="cog-outline" size={18} color={theme.accent} />
                  <Text style={styles.sectionCardTitle}>TRAINING PREFERENCES</Text>
                </View>
              </View>

              {/* Unit Preference Switcher */}
              <View style={styles.prefRow}>
                <View style={styles.prefLeft}>
                  <Text style={styles.prefTitle}>Weight Unit</Text>
                  <Text style={styles.prefSubtitle}>Used for logging, conversion & calculations</Text>
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
                          isSelected && [
                            styles.unitChoiceBtnSelected,
                            { backgroundColor: theme.accent },
                          ],
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

              {/* Target Workout Frequency */}
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
                          isSelected && [
                            styles.freqBtnSelected,
                            { backgroundColor: theme.accent, borderColor: theme.accent },
                          ],
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

              {/* App Version Info Footer */}
              <View style={styles.appInfoFooter}>
                <Text style={styles.appInfoText}>RepLog Pro · v1.0.0</Text>
                <Text style={styles.appInfoSub}>Clean, offline-first bodybuilding workout log</Text>
              </View>
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
    borderWidth: 1.5,
    borderColor: Brand.cardBorder,
    gap: Spacing.four,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarGlowContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  profileInfoCol: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  athleteName: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  athleteSub: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  matrixContainer: {
    gap: Spacing.two,
  },
  matrixRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  matrixCard: {
    flex: 1,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: 4,
  },
  matrixCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  matrixLabel: {
    color: Brand.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  matrixValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  progressionSectionWrapper: {
    gap: Spacing.four,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: Spacing.one,
  },
  sectionTag: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 28,
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
  openStudioPill: {
    backgroundColor: Brand.cardElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHelper: {
    color: Brand.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  themesGrid: {
    gap: 8,
  },
  themeCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  themeDotBig: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  themeNameCol: {
    flex: 1,
    gap: 1,
  },
  themePillName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  themeSubText: {
    color: Brand.textMuted,
    fontSize: 11,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  appInfoFooter: {
    alignItems: 'center',
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    gap: 2,
  },
  appInfoText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  appInfoSub: {
    color: Brand.textMuted,
    fontSize: 10,
  },
  pressed: {
    opacity: 0.8,
  },
});
