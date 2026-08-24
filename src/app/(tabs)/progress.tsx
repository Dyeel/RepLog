import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BodyweightChart,
  LogWeightModal,
  StrengthProgressionChart,
} from '@/components/analytics';
import { BottomTabInset, Brand, Radius, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { formatDateTime } from '@/lib/utils';

export default function ProgressScreen() {
  const { isReady, bodyWeightLogs, logs, unitPreference, deleteBodyWeightLog } =
    useWorkoutStore();

  const [isLogWeightVisible, setIsLogWeightVisible] = useState(false);

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Brand.emerald} />
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
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <View>
              <Text style={styles.sectionTag}>BODY & STRENGTH OVERLOAD</Text>
              <Text style={styles.headline}>Progress</Text>
            </View>

            <Pressable
              onPress={() => setIsLogWeightVisible(true)}
              style={({ pressed }) => [styles.addLogBtn, pressed && styles.pressed]}>
              <MaterialCommunityIcons name="scale-bathroom" size={16} color="#050507" />
              <Text style={styles.addLogBtnText}>Log Weigh-In</Text>
            </Pressable>
          </Animated.View>

          {/* 1. Interactive Bodyweight SVG Progression Curve */}
          <Animated.View entering={FadeInDown.delay(100).duration(450)}>
            <BodyweightChart
              logs={bodyWeightLogs}
              unit={unitPreference}
              onOpenLogModal={() => setIsLogWeightVisible(true)}
            />
          </Animated.View>

          {/* 2. Exercise Lift Strength 1RM Progression Curve */}
          <Animated.View entering={FadeInDown.delay(200).duration(450)}>
            <StrengthProgressionChart logs={logs} unit={unitPreference} />
          </Animated.View>

          {/* 3. Scale Weigh-in History */}
          <Animated.View entering={FadeInDown.delay(300).duration(450)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>SCALE WEIGH-IN HISTORY</Text>
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
          </Animated.View>
        </ScrollView>

        {/* Log Weight Modal Sheet */}
        <LogWeightModal
          visible={isLogWeightVisible}
          unit={unitPreference}
          onClose={() => setIsLogWeightVisible(false)}
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
    alignItems: 'flex-end',
  },
  sectionTag: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  addLogBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.emerald,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
  },
  addLogBtnText: {
    color: '#050507',
    fontSize: 12,
    fontWeight: '800',
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  historyCount: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyHistory: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    alignItems: 'center',
    gap: 4,
  },
  emptyHistoryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyHistorySub: {
    color: Brand.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  historyList: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
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
    color: Brand.emerald,
    fontSize: 12,
    fontWeight: '700',
  },
  historyDate: {
    color: Brand.textSecondary,
    fontSize: 12,
  },
  historyNote: {
    color: Brand.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
  deleteBtn: {
    padding: 8,
    borderRadius: Radius.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  pressed: {
    opacity: 0.8,
  },
});
