import { StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing, getSplitBadgeColor } from '@/constants/theme';
import { getScheduleAbbreviation } from '@/lib/utils';
import { DAY_SHORT_LABELS, DayOfWeek, ScheduleDay } from '@/types';

type WeeklyScheduleStripProps = {
  schedule: ScheduleDay[];
  activeDay: DayOfWeek;
};

export function WeeklyScheduleStrip({ schedule, activeDay }: WeeklyScheduleStripProps) {
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
                isActive && styles.dayColumnActive,
              ]}>
              <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>
                {DAY_SHORT_LABELS[entry.day]}
              </Text>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isActive ? Brand.emerald : badgeStyle.bg,
                    borderColor: isActive ? Brand.emeraldGlow : badgeStyle.border,
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

              {isActive && <View style={styles.activeDot} />}
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
    borderRadius: Radius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
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
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  dayLabel: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  dayLabelActive: {
    color: Brand.emerald,
    fontWeight: '700',
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
    backgroundColor: Brand.emerald,
  },
});
