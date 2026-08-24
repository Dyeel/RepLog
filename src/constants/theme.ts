import '@/global.css';

import { Platform } from 'react-native';

export const Brand = {
  // Pure Stealth Monochrome Palette
  background: '#050507',
  backgroundSecondary: '#0B0C0E',
  card: '#111216',
  cardElevated: '#17181E',
  cardHighlight: '#1F2028',

  // Hairline borders
  cardBorder: 'rgba(255, 255, 255, 0.07)',
  cardBorderHover: 'rgba(255, 255, 255, 0.14)',
  cardBorderFocus: 'rgba(255, 255, 255, 0.28)',

  // Signature clean emerald & titanium accents (Single surgical accent)
  emerald: '#10B981',
  emeraldMuted: 'rgba(16, 185, 129, 0.12)',
  emeraldGlow: '#34D399',

  // Pure monochrome text hierarchy
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#525E70',
  textSubtle: '#333D4B',

  // Utility colors (used sparingly for functional status)
  danger: '#EF4444',
  dangerMuted: 'rgba(239, 68, 68, 0.12)',
  amber: '#F59E0B',
  amberMuted: 'rgba(245, 158, 11, 0.12)',
} as const;

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    accent: '#000000',
    card: '#F0F0F3',
  },
  dark: {
    text: Brand.textPrimary,
    background: Brand.background,
    backgroundElement: Brand.card,
    backgroundSelected: Brand.cardElevated,
    textSecondary: Brand.textSecondary,
    accent: Brand.emerald,
    card: Brand.card,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 84, default: 68 }) ?? 68;
export const MaxContentWidth = 800;

// Unified disciplined monochrome split badge styling (No distracting rainbow colors)
export function getSplitBadgeColor(label: string): { bg: string; text: string; border: string } {
  const norm = label.toLowerCase();
  if (norm.includes('rest')) {
    return {
      bg: 'rgba(255, 255, 255, 0.03)',
      text: Brand.textMuted,
      border: 'rgba(255, 255, 255, 0.06)',
    };
  }
  return {
    bg: 'rgba(255, 255, 255, 0.06)',
    text: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.12)',
  };
}
