import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { calculate1RMData } from '@/lib/utils';
import { WeightUnit } from '@/types';

type OneRepMaxPreviewProps = {
  weight: string;
  reps: string;
  unit: WeightUnit;
};

export function OneRepMaxPreview({ weight, reps, unit }: OneRepMaxPreviewProps) {
  const [showPercentages, setShowPercentages] = useState(false);
  const data = calculate1RMData(weight, reps);

  if (!data || data.estimated1RM <= 0) return null;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setShowPercentages(!showPercentages)}
        style={({ pressed }) => [styles.headerRow, pressed && styles.pressed]}>
        <View style={styles.leftCol}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="calculator-variant-outline" size={15} color={Brand.emerald} />
          </View>
          <View>
            <Text style={styles.label}>ESTIMATED 1RM</Text>
            <Text style={styles.oneRmValue}>
              {data.estimated1RM} <Text style={styles.unitText}>{unit}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.formulaTag}>Epley</Text>
          <MaterialCommunityIcons
            name={showPercentages ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Brand.textMuted}
          />
        </View>
      </Pressable>

      {/* Expanded Training Percentages Breakdown */}
      {showPercentages && (
        <View style={styles.percentagesTable}>
          <Text style={styles.tableTitle}>TRAINING LOAD TARGETS</Text>
          <View style={styles.grid}>
            {data.percentages.map((item) => (
              <View key={item.percentage} style={styles.gridItem}>
                <Text style={styles.percentageText}>{item.percentage}%</Text>
                <Text style={styles.calcWeight}>
                  {item.weight} {unit}
                </Text>
                <Text style={styles.repsHint}>{item.repsRange}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Brand.emeraldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  oneRmValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  unitText: {
    color: Brand.emerald,
    fontSize: 12,
    fontWeight: '700',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  formulaTag: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  percentagesTable: {
    backgroundColor: Brand.cardElevated,
    padding: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
    gap: Spacing.two,
  },
  tableTitle: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  gridItem: {
    width: '31%',
    backgroundColor: Brand.card,
    borderRadius: Radius.xs,
    padding: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: 2,
  },
  percentageText: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  calcWeight: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  repsHint: {
    color: Brand.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.8,
  },
});
