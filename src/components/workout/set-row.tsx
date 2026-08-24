import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { calculate1RM } from '@/lib/utils';
import { SetType, WeightUnit, WorkoutSet } from '@/types';

type SetRowProps = {
  set: WorkoutSet;
  index: number;
  unit: WeightUnit;
  onChange: (id: string, field: 'weight' | 'reps', value: string) => void;
  onToggleType?: (id: string) => void;
  onOpenPlateCalculator?: (weight: string) => void;
  onRemove: (id: string) => void;
  onDuplicate?: (id: string) => void;
  canRemove: boolean;
};

const SET_TYPES: SetType[] = ['normal', 'warmup', 'dropset', 'failure'];

export function SetRow({
  set,
  index,
  unit,
  onChange,
  onToggleType,
  onOpenPlateCalculator,
  onRemove,
  onDuplicate,
  canRemove,
}: SetRowProps) {
  const currentType = set.type ?? 'normal';
  const estimated1RM = calculate1RM(set.weight, set.reps);

  const getBadgeLabel = () => {
    switch (currentType) {
      case 'warmup':
        return 'W';
      case 'dropset':
        return 'D';
      case 'failure':
        return 'F';
      default:
        return `${index + 1}`;
    }
  };

  const getBadgeColor = () => {
    switch (currentType) {
      case 'warmup':
        return { bg: 'rgba(245, 158, 11, 0.12)', text: Brand.amber, border: 'rgba(245, 158, 11, 0.25)' };
      case 'dropset':
        return { bg: 'rgba(255, 255, 255, 0.08)', text: '#E2E8F0', border: 'rgba(255, 255, 255, 0.18)' };
      case 'failure':
        return { bg: 'rgba(239, 68, 68, 0.12)', text: Brand.danger, border: 'rgba(239, 68, 68, 0.25)' };
      default:
        return { bg: Brand.cardElevated, text: Brand.textPrimary, border: Brand.cardBorder };
    }
  };

  const badgeStyle = getBadgeColor();

  return (
    <View style={styles.container}>
      {/* Set Number / Type Toggle Button */}
      <Pressable
        onPress={() => onToggleType && onToggleType(set.id)}
        style={({ pressed }) => [
          styles.badge,
          { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border },
          pressed && styles.actionPressed,
        ]}>
        <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{getBadgeLabel()}</Text>
      </Pressable>

      {/* Input Fields */}
      <View style={styles.inputsRow}>
        {/* Weight Field */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>WEIGHT ({unit.toUpperCase()})</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={set.weight}
              onChangeText={(val) => onChange(set.id, 'weight', val)}
              placeholder="0"
              placeholderTextColor={Brand.textMuted}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              style={styles.textInput}
            />
            {onOpenPlateCalculator && set.weight && parseFloat(set.weight) > 0 ? (
              <Pressable
                onPress={() => onOpenPlateCalculator(set.weight)}
                style={styles.plateTriggerBtn}>
                <MaterialCommunityIcons name="weight-lifter" size={14} color={Brand.emerald} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Reps Field */}
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>REPS</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={set.reps}
              onChangeText={(val) => onChange(set.id, 'reps', val)}
              placeholder="0"
              placeholderTextColor={Brand.textMuted}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              style={styles.textInput}
            />
          </View>
        </View>
      </View>

      {/* 1RM Preview Pill */}
      {estimated1RM > 0 && (
        <View style={styles.oneRmCol}>
          <Text style={styles.oneRmLabel}>1RM</Text>
          <Text style={styles.oneRmVal}>{estimated1RM}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {onDuplicate && (
          <Pressable
            onPress={() => onDuplicate(set.id)}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}>
            <MaterialCommunityIcons name="content-copy" size={14} color={Brand.textSecondary} />
          </Pressable>
        )}

        {canRemove ? (
          <Pressable
            onPress={() => onRemove(set.id)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed && styles.actionPressed,
            ]}>
            <MaterialCommunityIcons name="trash-can-outline" size={15} color={Brand.danger} />
          </Pressable>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.card,
    borderRadius: Radius.md,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.two,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  inputsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  inputWrapper: {
    flex: 1,
    gap: 2,
  },
  inputLabel: {
    color: Brand.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    paddingLeft: 2,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    paddingHorizontal: Spacing.two,
    height: 40,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    padding: 0,
  },
  plateTriggerBtn: {
    padding: 4,
  },
  oneRmCol: {
    alignItems: 'center',
    minWidth: 32,
    paddingHorizontal: 2,
  },
  oneRmLabel: {
    color: Brand.textMuted,
    fontSize: 8,
    fontWeight: '800',
  },
  oneRmVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Brand.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  actionPressed: {
    opacity: 0.7,
  },
  actionPlaceholder: {
    width: 30,
  },
});
