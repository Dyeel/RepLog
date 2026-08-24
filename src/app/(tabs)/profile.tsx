import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { BottomTabInset, Brand, Radius, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { useTheme } from '@/hooks/use-theme';
import { formatDateTime } from '@/lib/utils';
import { showAlert } from '@/lib/alert';
import { WeightUnit, WorkoutFrequency } from '@/types';

const FREQUENCIES: WorkoutFrequency[] = [2, 3, 4, 5, 6];

export default function ProfileScreen() {
  const {
    isReady,
    bodyWeightLogs,
    logs,
    sessions,
    stats,
    frequency,
    unitPreference,
    profilePhotoUri,
    athleteName,
    setProfilePhotoUri,
    setAthleteName,
    setUnitPreference,
    setFrequency,
    deleteBodyWeightLog,
  } = useWorkoutStore();

  const theme = useTheme();
  const [isLogWeightVisible, setIsLogWeightVisible] = useState(false);
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(athleteName || 'Athlete Profile');

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

  const handleAvatarPress = () => {
    if (profilePhotoUri) {
      showAlert('Profile Photo', 'Update or remove your avatar photo', [
        { text: 'Choose New Photo', onPress: pickImageFromLibrary },
        { text: 'Remove Photo', style: 'destructive', onPress: () => setProfilePhotoUri(null) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      pickImageFromLibrary();
    }
  };

  const pickImageFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert(
          'Photo Permission Needed',
          'Please allow access to your photo library to set a custom profile photo.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await setProfilePhotoUri(result.assets[0].uri);
      }
    } catch (e) {
      showAlert('Error', 'Unable to pick image. Please try again.');
    }
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setAthleteName(nameInput.trim());
    }
    setIsEditingName(false);
  };

  const handleDeleteEntry = (id: string, weight: number) => {
    showAlert(
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
            {/* Header with Top-Right Little Theme Button */}
            <View style={styles.header}>
              <View>
                <Text style={styles.sectionTag}>ATHLETE HUB</Text>
                <Text style={styles.mainHeadline}>Profile</Text>
              </View>

              <Pressable
                onPress={() => setIsThemeModalVisible(true)}
                style={({ pressed }) => [
                  styles.topRightThemeBtn,
                  { borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}12` },
                  pressed && styles.pressed,
                ]}>
                <MaterialCommunityIcons name="palette-outline" size={17} color={theme.accent} />
                <Text style={[styles.topRightThemeText, { color: theme.accent }]}>Theme</Text>
              </Pressable>
            </View>

            {/* 1. Athlete Profile Card */}
            <View style={[styles.profileHeroCard, { borderColor: `${theme.accent}30` }]}>
              <View style={styles.profileHeaderRow}>
                {/* Interactive Avatar with Photo Picker */}
                <Pressable
                  onPress={handleAvatarPress}
                  style={({ pressed }) => [
                    styles.avatarWrapper,
                    { borderColor: theme.accent, shadowColor: theme.accent },
                    pressed && styles.pressed,
                  ]}>
                  {profilePhotoUri ? (
                    <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
                  ) : (
                    <View
                      style={[
                        styles.avatarPlaceholder,
                        { backgroundColor: `${theme.accent}15` },
                      ]}>
                      <MaterialCommunityIcons name="arm-flex" size={32} color={theme.accent} />
                    </View>
                  )}

                  {/* Little Camera Badge Overlay */}
                  <View style={[styles.cameraBadge, { backgroundColor: theme.accent }]}>
                    <MaterialCommunityIcons name="camera" size={12} color="#050507" />
                  </View>
                </Pressable>

                {/* Profile Name & Level Badge */}
                <View style={styles.profileInfoCol}>
                  <View style={styles.nameRow}>
                    {isEditingName ? (
                      <View style={styles.nameEditRow}>
                        <TextInput
                          value={nameInput}
                          onChangeText={setNameInput}
                          autoFocus
                          onSubmitEditing={handleSaveName}
                          style={styles.nameInput}
                          placeholderTextColor={Brand.textMuted}
                        />
                        <Pressable onPress={handleSaveName} style={styles.saveNameBtn}>
                          <MaterialCommunityIcons name="check" size={16} color={theme.accent} />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => {
                          setNameInput(athleteName || 'Athlete Profile');
                          setIsEditingName(true);
                        }}
                        style={styles.namePressableRow}>
                        <Text style={styles.athleteName} numberOfLines={1}>
                          {athleteName || 'Athlete Profile'}
                        </Text>
                        <MaterialCommunityIcons
                          name="pencil-outline"
                          size={15}
                          color={Brand.textMuted}
                        />
                      </Pressable>
                    )}

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${theme.accent}20`, borderColor: theme.accent },
                      ]}>
                      <View style={[styles.statusDot, { backgroundColor: theme.accent }]} />
                      <Text style={[styles.statusBadgeText, { color: theme.accent }]}>
                        ACTIVE
                      </Text>
                    </View>
                  </View>

                  <Pressable onPress={handleAvatarPress}>
                    <Text style={[styles.changePhotoText, { color: theme.accent }]}>
                      {profilePhotoUri ? 'Tap to change photo' : '+ Upload avatar photo'}
                    </Text>
                  </Pressable>
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
                      <MaterialCommunityIcons
                        name="chart-bell-curve-cumulative"
                        size={14}
                        color={Brand.textSecondary}
                      />
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
                      <Text style={styles.matrixLabel}>WEEKLY TARGET</Text>
                    </View>
                    <Text style={[styles.matrixValue, { color: theme.accent }]}>
                      {frequency}D / wk
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 2. Progression Section (Placed Directly Below Profile) */}
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

            {/* 3. Training Preferences & App Settings */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTag: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  mainHeadline: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  topRightThemeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 7,
    borderWidth: 1,
  },
  topRightThemeText: {
    fontSize: 12,
    fontWeight: '800',
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
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#050507',
  },
  profileInfoCol: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  namePressableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  nameInput: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    paddingVertical: 2,
    paddingHorizontal: 0,
    flex: 1,
  },
  saveNameBtn: {
    padding: 4,
  },
  athleteName: {
    color: '#FFFFFF',
    fontSize: 19,
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
  changePhotoText: {
    fontSize: 11,
    fontWeight: '700',
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
