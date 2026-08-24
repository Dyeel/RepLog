import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WeightUnit } from '@/types';

type UnitToggleProps = {
  value: WeightUnit;
  onChange: (unit: WeightUnit) => void;
  compact?: boolean;
};

export function UnitToggle({ value, onChange, compact }: UnitToggleProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Pressable
        onPress={() => onChange('kg')}
        style={({ pressed }) => [
          styles.pill,
          compact && styles.pillCompact,
          value === 'kg' && [styles.pillActive, { backgroundColor: theme.accent }],
          pressed && styles.pressed,
        ]}>
        <Text
          style={[
            styles.label,
            compact && styles.labelCompact,
            value === 'kg' && styles.labelActive,
          ]}>
          KG
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange('lbs')}
        style={({ pressed }) => [
          styles.pill,
          compact && styles.pillCompact,
          value === 'lbs' && [styles.pillActive, { backgroundColor: theme.accent }],
          pressed && styles.pressed,
        ]}>
        <Text
          style={[
            styles.label,
            compact && styles.labelCompact,
            value === 'lbs' && styles.labelActive,
          ]}>
          LBS
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  containerCompact: {
    padding: 2,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillCompact: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  pillActive: {
    backgroundColor: Brand.emerald,
  },
  label: {
    color: Brand.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  labelCompact: {
    fontSize: 11,
  },
  labelActive: {
    color: '#090A0E',
  },
  pressed: {
    opacity: 0.8,
  },
});
