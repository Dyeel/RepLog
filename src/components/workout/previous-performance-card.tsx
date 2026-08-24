import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { PreviousPerformance } from '@/lib/utils';
import { WeightUnit, WorkoutSet } from '@/types';

type PreviousPerformanceCardProps = {
  performance: PreviousPerformance | null;
  currentUnit: WeightUnit;
  onApplyPreviousSets: (sets: WorkoutSet[]) => void;
};

export function PreviousPerformanceCard({
  performance,
  currentUnit,
  onApplyPreviousSets,
}: PreviousPerformanceCardProps) {
  if (!performance) return null;

  const setsSummary = performance.sets
    .map((set) => `${set.weight || '0'}${performance.unit} × ${set.reps || '0'}`)
    .join(' · ');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="history" size={16} color={Brand.emerald} />
          <Text style={styles.title}>LAST SESSION ({performance.dateLabel})</Text>
        </View>

        <Pressable
          onPress={() => onApplyPreviousSets(performance.sets)}
          style={({ pressed }) => [styles.copyBtn, pressed && styles.pressed]}>
          <MaterialCommunityIcons name="content-copy" size={13} color={Brand.emerald} />
          <Text style={styles.copyText}>Copy Sets</Text>
        </Pressable>
      </View>

      <Text style={styles.setsSummary} numberOfLines={2}>
        {setsSummary}
      </Text>

      {performance.bestSet && (
        <View style={styles.bestSetRow}>
          <Text style={styles.bestLabel}>Top Set:</Text>
          <Text style={styles.bestValue}>
            {performance.bestSet.weight} {performance.unit} × {performance.bestSet.reps} reps
          </Text>
          {performance.estimated1RM > 0 && (
            <Text style={styles.rmTag}>
              (~{performance.estimated1RM} {performance.unit} 1RM)
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.card,
    borderRadius: Radius.md,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    gap: Spacing.one,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: Brand.emerald,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Brand.emeraldMuted,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.xs,
  },
  copyText: {
    color: Brand.emerald,
    fontSize: 11,
    fontWeight: '700',
  },
  setsSummary: {
    color: Brand.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  bestSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    marginTop: 4,
  },
  bestLabel: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  bestValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  rmTag: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.8,
  },
});
