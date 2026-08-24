import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { calculatePlates } from '@/lib/plate-calculator';
import { WeightUnit } from '@/types';

type PlateCalculatorModalProps = {
  visible: boolean;
  initialWeight: string;
  unit: WeightUnit;
  onClose: () => void;
};

export function PlateCalculatorModal({
  visible,
  initialWeight,
  unit,
  onClose,
}: PlateCalculatorModalProps) {
  const [weightInput, setWeightInput] = useState(initialWeight || '100');
  const [barWeight, setBarWeight] = useState(unit === 'kg' ? 20 : 45);

  const calc = calculatePlates(weightInput, unit, barWeight);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="weight-lifter" size={20} color={Brand.emerald} />
              <Text style={styles.headerTitle}>BARBELL PLATE CALCULATOR</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={Brand.textMuted} />
            </Pressable>
          </View>

          {/* Weight Input & Bar Settings */}
          <View style={styles.inputSection}>
            <View style={styles.weightRow}>
              <Text style={styles.inputLabel}>TARGET TOTAL WEIGHT</Text>
              <View style={styles.inputBox}>
                <TextInput
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={Brand.textMuted}
                  style={styles.weightTextInput}
                />
                <Text style={styles.unitSuffix}>{unit.toUpperCase()}</Text>
              </View>
            </View>

            {/* Bar Weight Selector */}
            <View style={styles.barWeightRow}>
              <Text style={styles.barLabel}>Barbell Weight:</Text>
              <View style={styles.barPills}>
                {(unit === 'kg' ? [20, 15] : [45, 35]).map((weight) => {
                  const selected = barWeight === weight;
                  return (
                    <Pressable
                      key={weight}
                      onPress={() => setBarWeight(weight)}
                      style={[styles.barPill, selected && styles.barPillActive]}>
                      <Text style={[styles.barPillText, selected && styles.barPillTextActive]}>
                        {weight} {unit}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Visual Barbell Graphic */}
          <View style={styles.barbellVisual}>
            <Text style={styles.perSideLabel}>
              PER SIDE:{' '}
              <Text style={styles.perSideValue}>
                {calc.weightPerSide > 0 ? calc.weightPerSide : 0} {unit}
              </Text>
            </Text>

            {/* Sleeve & Plates Stack Graphic */}
            <View style={styles.sleeveContainer}>
              <View style={styles.collar} />
              <View style={styles.sleeveBar} />

              <View style={styles.platesStack}>
                {calc.plates.map((plateGroup) =>
                  Array.from({ length: plateGroup.count }).map((_, idx) => (
                    <View
                      key={`${plateGroup.weight}-${idx}`}
                      style={[
                        styles.plateDisc,
                        {
                          backgroundColor: plateGroup.color,
                          height: Math.min(100, 48 + plateGroup.weight * 1.2),
                        },
                      ]}>
                      <Text style={styles.plateDiscText}>{plateGroup.weight}</Text>
                    </View>
                  )),
                )}
              </View>
            </View>
          </View>

          {/* Detailed Plates Breakdown List */}
          <View style={styles.breakdownList}>
            <Text style={styles.breakdownTitle}>LOAD EACH SIDE WITH:</Text>
            {calc.plates.length === 0 ? (
              <Text style={styles.emptyNote}>
                Weight is equal to or lighter than the empty bar ({barWeight} {unit}).
              </Text>
            ) : (
              calc.plates.map((p) => (
                <View key={p.weight} style={styles.plateRow}>
                  <View style={[styles.plateColorDot, { backgroundColor: p.color }]} />
                  <Text style={styles.plateRowName}>
                    {p.weight} {unit} plate
                  </Text>
                  <Text style={styles.plateRowCount}>
                    {p.count}× per side <Text style={styles.totalP}>({p.count * 2} total)</Text>
                  </Text>
                </View>
              ))
            )}

            {calc.remainder > 0 && (
              <Text style={styles.remainderText}>
                ⚠️ Note: {calc.remainder} {unit} cannot be loaded with standard plates.
              </Text>
            )}
          </View>

          {/* Done Button */}
          <Pressable onPress={onClose} style={styles.doneButton}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    width: '100%',
    maxWidth: 420,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  closeBtn: {
    padding: 4,
  },
  inputSection: {
    gap: Spacing.two,
  },
  weightRow: {
    gap: 4,
  },
  inputLabel: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    paddingHorizontal: Spacing.three,
    height: 48,
  },
  weightTextInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  unitSuffix: {
    color: Brand.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  barWeightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barLabel: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  barPills: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  barPill: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    backgroundColor: Brand.cardElevated,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  barPillActive: {
    backgroundColor: Brand.emeraldMuted,
    borderColor: Brand.emerald,
  },
  barPillText: {
    color: Brand.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  barPillTextActive: {
    color: Brand.emerald,
  },
  barbellVisual: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  perSideLabel: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  perSideValue: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sleeveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
    width: '100%',
    justifyContent: 'flex-start',
    paddingLeft: Spacing.two,
  },
  collar: {
    width: 14,
    height: 60,
    backgroundColor: '#64748B',
    borderRadius: 3,
  },
  sleeveBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#334155',
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  platesStack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
    zIndex: 10,
  },
  plateDisc: {
    width: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.4)',
  },
  plateDiscText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    transform: [{ rotate: '-90deg' }],
  },
  breakdownList: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  breakdownTitle: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  emptyNote: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  plateColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  plateRowName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginLeft: 6,
  },
  plateRowCount: {
    color: Brand.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  totalP: {
    color: Brand.textMuted,
    fontSize: 11,
  },
  remainderText: {
    color: Brand.amber,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  doneButton: {
    backgroundColor: Brand.emerald,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#050507',
    fontSize: 15,
    fontWeight: '800',
  },
});
