import { THEME_PALETTES, ThemeDefinition } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';

export function useTheme(): ThemeDefinition {
  const { themeId } = useWorkoutStore();
  return THEME_PALETTES[themeId] ?? THEME_PALETTES.emerald;
}
