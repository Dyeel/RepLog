import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  compact?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function GradientButton({
  label,
  onPress,
  icon,
  disabled,
  style,
  compact,
  variant = 'primary',
}: GradientButtonProps) {
  const gradientColors: [string, string] =
    variant === 'danger'
      ? ['#F43F5E', '#BE123C']
      : variant === 'secondary'
      ? ['#1C1E2A', '#13141C']
      : ['#10B981', '#059669'];

  const textColor = variant === 'secondary' ? Brand.textPrimary : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.wrapper, style, pressed && !disabled && styles.pressed]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.button,
          compact && styles.buttonCompact,
          variant === 'primary' && styles.primaryGlow,
          disabled && styles.disabled,
        ]}>
        {icon}
        <Text style={[styles.label, { color: textColor }, compact && styles.labelCompact]}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  button: {
    minHeight: 56,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  primaryGlow: {
    shadowColor: Brand.emerald,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonCompact: {
    minHeight: 50,
    borderRadius: Radius.md,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelCompact: {
    fontSize: 15,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
