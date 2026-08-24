import '@/global.css';
import { Platform } from 'react-native';

import { ThemeId } from '@/types';

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  subtitle: string;
  accent: string;
  accentGlow: string;
  accentMuted: string;
  gradient: [string, string];
  background: string;
  card: string;
  cardElevated: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  backgroundElement: string;
  backgroundSelected: string;
};

export const THEME_PALETTES: Record<ThemeId, ThemeDefinition> = {
  emerald: {
    id: 'emerald',
    name: 'Stealth Emerald',
    subtitle: 'Cyberpunk Gym · Cyber Green',
    accent: '#10B981',
    accentGlow: '#34D399',
    accentMuted: 'rgba(16, 185, 129, 0.14)',
    gradient: ['#10B981', '#059669'],
    background: '#050507',
    card: '#111216',
    cardElevated: '#17181E',
    cardBorder: 'rgba(255, 255, 255, 0.07)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    backgroundElement: '#111216',
    backgroundSelected: '#17181E',
  },
  cobalt: {
    id: 'cobalt',
    name: 'Electric Cobalt',
    subtitle: 'High Voltage · Hyper Blue',
    accent: '#3B82F6',
    accentGlow: '#60A5FA',
    accentMuted: 'rgba(59, 130, 246, 0.14)',
    gradient: ['#3B82F6', '#1D4ED8'],
    background: '#040711',
    card: '#0C1220',
    cardElevated: '#131C30',
    cardBorder: 'rgba(59, 130, 246, 0.12)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    backgroundElement: '#0C1220',
    backgroundSelected: '#131C30',
  },
  violet: {
    id: 'violet',
    name: 'Neon Violet',
    subtitle: 'Synthwave · Cyber Purple',
    accent: '#A855F7',
    accentGlow: '#C084FC',
    accentMuted: 'rgba(168, 85, 247, 0.14)',
    gradient: ['#A855F7', '#7E22CE'],
    background: '#08040F',
    card: '#140C22',
    cardElevated: '#1D1232',
    cardBorder: 'rgba(168, 85, 247, 0.12)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    backgroundElement: '#140C22',
    backgroundSelected: '#1D1232',
  },
  amber: {
    id: 'amber',
    name: 'Solar Amber',
    subtitle: 'Forge & Iron · Gold Energy',
    accent: '#F59E0B',
    accentGlow: '#FBBF24',
    accentMuted: 'rgba(245, 158, 11, 0.14)',
    gradient: ['#F59E0B', '#D97706'],
    background: '#0A0704',
    card: '#161009',
    cardElevated: '#21180E',
    cardBorder: 'rgba(245, 158, 11, 0.12)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    backgroundElement: '#161009',
    backgroundSelected: '#21180E',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Beast',
    subtitle: 'Aggressive Red · PR Mode',
    accent: '#EF4444',
    accentGlow: '#F87171',
    accentMuted: 'rgba(239, 68, 68, 0.14)',
    gradient: ['#EF4444', '#B91C1C'],
    background: '#0A0404',
    card: '#160B0B',
    cardElevated: '#221111',
    cardBorder: 'rgba(239, 68, 68, 0.12)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    backgroundElement: '#160B0B',
    backgroundSelected: '#221111',
  },
  platinum: {
    id: 'platinum',
    name: 'Monochrome Platinum',
    subtitle: 'Executive Titanium · Clean White',
    accent: '#F8FAFC',
    accentGlow: '#FFFFFF',
    accentMuted: 'rgba(255, 255, 255, 0.14)',
    gradient: ['#F8FAFC', '#94A3B8'],
    background: '#080808',
    card: '#141414',
    cardElevated: '#1E1E1E',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    backgroundElement: '#141414',
    backgroundSelected: '#1E1E1E',
  },
};

export const Brand = {
  // Deep Luxury Charcoal & OLED Palette
  background: '#07080B',
  backgroundSecondary: '#0D0F14',
  card: '#10141C',
  cardElevated: '#161B26',
  cardHighlight: '#1F2636',

  // Frosted hairline borders with depth
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderHover: 'rgba(255, 255, 255, 0.16)',
  cardBorderFocus: 'rgba(255, 255, 255, 0.32)',

  // Signature clean emerald & titanium accents
  emerald: '#10B981',
  emeraldMuted: 'rgba(16, 185, 129, 0.14)',
  emeraldGlow: '#34D399',

  // Monochrome text hierarchy
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textSubtle: '#334155',

  // Functional status colors
  danger: '#EF4444',
  dangerMuted: 'rgba(239, 68, 68, 0.14)',
  amber: '#F59E0B',
  amberMuted: 'rgba(245, 158, 11, 0.14)',
} as const;

export const Shadows = {
  card: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  cardElevated: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  }),
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

export const BottomTabInset = Platform.select({ ios: 78, default: 70 }) ?? 70;
export const MaxContentWidth = 800;

// Unified disciplined monochrome split badge styling
export function getSplitBadgeColor(label: string): { bg: string; text: string; border: string } {
  const norm = label.toLowerCase();
  if (norm.includes('rest')) {
    return {
      bg: 'rgba(255, 255, 255, 0.04)',
      text: Brand.textMuted,
      border: 'rgba(255, 255, 255, 0.08)',
    };
  }
  return {
    bg: 'rgba(255, 255, 255, 0.08)',
    text: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.15)',
  };
}
