import { StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Shadows, Spacing, getSplitBadgeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getScheduleAbbreviation } from '@/lib/utils';
import { DAY_SHORT_LABELS, DayOfWeek, ScheduleDay } from '@/types';

type WeeklyScheduleStripProps = {
  schedule: ScheduleDay[];
  activeDay: DayOfWeek;
};

export function WeeklyScheduleStrip({ schedule, activeDay }: WeeklyScheduleStripProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WEEKLY SPLIT</Text>
        <Text style={styles.subtitle}>7-day schedule</Text>
      </View>

      <View style={styles.row}>
        {schedule.map((entry) => {
          const isActive = entry.day === activeDay;
          const abbrev = getScheduleAbbreviation(entry.label);
          const badgeStyle = getSplitBadgeColor(entry.label);
          const isRest = entry.label.toLowerCase() === 'rest';

          return (
            <View
              key={entry.day}
              style={[
                styles.dayColumn,
                isActive && [
                  styles.dayColumnActive,
                  {
                    backgroundColor: `${theme.accent}12`,
                    borderColor: `${theme.accent}40`,
                  },
                ],
              ]}>
              <Text
                style={[
                  styles.dayLabel,
                  isActive && { color: theme.accent, fontWeight: '800' },
                ]}>
                {DAY_SHORT_LABELS[entry.day]}
              </Text>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isActive ? theme.accent : badgeStyle.bg,
                    borderColor: isActive ? theme.accentGlow : badgeStyle.border,
                  },
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: isActive ? '#090A0E' : isRest ? Brand.textMuted : badgeStyle.text,
                      fontWeight: isActive ? '800' : '700',
                    },
                  ]}>
                  {abbrev}
                </Text>
              </View>

              {isActive && (
                <View style={[styles.activeDot, { backgroundColor: theme.accent }]} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  dayColumn: {
    alignItems: 'center',
    gap: Spacing.one,
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  dayColumnActive: {
    borderWidth: 1,
  },
  dayLabel: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
