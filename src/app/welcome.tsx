import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton, RepLogLogo, UnitToggle } from '@/components/ui';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { WeightUnit, WorkoutFrequency } from '@/types';

export default function WelcomeScreen() {
  const { completeOnboarding } = useWorkoutStore();
  const [selectedUnit, setSelectedUnit] = useState<WeightUnit>('kg');
  const [selectedFrequency, setSelectedFrequency] = useState<WorkoutFrequency>(3);

  const handleGetStarted = async () => {
    await completeOnboarding({
      unit: selectedUnit,
      frequency: selectedFrequency,
    });
    router.replace('/' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <RepLogLogo size={90} />

            <View style={styles.wordmark}>
              <Text style={styles.rep}>REP</Text>
              <Text style={styles.log}>LOG</Text>
            </View>

            <Text style={styles.tagline}>
              Precision Workout Logging & Split Architecture.{'\n'}Engineered for Progressive Overload.
            </Text>
          </View>

          {/* Preferences Card */}
          <View style={styles.preferencesCard}>
            {/* Unit Preference Picker */}
            <View style={styles.prefRow}>
              <View style={styles.prefTextCol}>
                <Text style={styles.prefTitle}>Weight Unit</Text>
                <Text style={styles.prefDesc}>Measurement standard</Text>
              </View>
              <UnitToggle value={selectedUnit} onChange={setSelectedUnit} />
            </View>

            <View style={styles.divider} />

            {/* Split Days Quick Choice */}
            <View style={styles.prefRow}>
              <View style={styles.prefTextCol}>
                <Text style={styles.prefTitle}>Training Split</Text>
                <Text style={styles.prefDesc}>Target workouts per week</Text>
              </View>

              <View style={styles.freqRow}>
                {([3, 4, 5] as WorkoutFrequency[]).map((days) => {
                  const isActive = selectedFrequency === days;
                  return (
                    <Text
                      key={days}
                      onPress={() => setSelectedFrequency(days)}
                      style={[styles.freqPill, isActive && styles.freqPillActive]}>
                      {days}D
                    </Text>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <GradientButton
              label="Initialize System"
              icon={<MaterialCommunityIcons name="arrow-right" size={20} color="#050507" />}
              onPress={handleGetStarted}
            />

            <View style={styles.privacyNotice}>
              <MaterialCommunityIcons name="shield-check-outline" size={14} color={Brand.textMuted} />
              <Text style={styles.privacyText}>Offline-first. Data remains 100% on your device.</Text>
            </View>
          </View>
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
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.four,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  rep: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 2,
  },
  log: {
    color: Brand.textMuted,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 2,
  },
  tagline: {
    color: Brand.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
  },
  preferencesCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prefTextCol: {
    gap: 2,
  },
  prefTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  prefDesc: {
    color: Brand.textMuted,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  freqRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  freqPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Brand.cardElevated,
    color: Brand.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    textAlign: 'center',
    overflow: 'hidden',
  },
  freqPillActive: {
    backgroundColor: '#FFFFFF',
    color: '#050507',
    borderColor: '#FFFFFF',
  },
  footer: {
    gap: Spacing.three,
    alignItems: 'center',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  privacyText: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
});
