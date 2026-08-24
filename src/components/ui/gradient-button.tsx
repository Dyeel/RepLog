import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
  const theme = useTheme();

  const gradientColors: [string, string] =
    variant === 'danger'
      ? ['#F43F5E', '#BE123C']
      : variant === 'secondary'
      ? ['#1C1E2A', '#13141C']
      : theme.gradient;

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
          variant === 'primary' && [styles.primaryGlow, { shadowColor: theme.accent }],
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
    minHeight: 54,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  primaryGlow: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonCompact: {
    minHeight: 48,
    borderRadius: Radius.pill,
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
