import { StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { DAYS_OF_WEEK, DAY_SHORT_LABELS, WeightUnit, WorkoutLog } from '@/types';

type VolumeChartProps = {
  logs: WorkoutLog[];
  unit: WeightUnit;
};

export function VolumeChart({ logs, unit }: VolumeChartProps) {
  const theme = useTheme();

  // Calculate volume for each day of current week
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const dailyVolume: Record<string, number> = {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  };

  let totalWeeklyVolume = 0;

  for (const log of logs) {
    const logDate = new Date(log.timestamp);
    if (logDate >= startOfWeek) {
      const dayName = DAYS_OF_WEEK[logDate.getDay() === 0 ? 6 : logDate.getDay() - 1];
      let vol = 0;
      for (const set of log.sets) {
        const w = parseFloat(set.weight) || 0;
        const r = parseInt(set.reps, 10) || 0;
        vol += w * r;
      }
      dailyVolume[dayName] = (dailyVolume[dayName] || 0) + vol;
      totalWeeklyVolume += vol;
    }
  }

  const maxVolume = Math.max(...Object.values(dailyVolume), 1000);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>WEEKLY VOLUME PROGRESSION</Text>
          <Text style={styles.totalValue}>
            {Math.round(totalWeeklyVolume).toLocaleString()}{' '}
            <Text style={[styles.unit, { color: theme.accent }]}>{unit}</Text>
          </Text>
        </View>
        <Text style={styles.subtext}>Current Week</Text>
      </View>

      {/* Bar Chart Display */}
      <View style={styles.chartContainer}>
        {DAYS_OF_WEEK.map((d) => {
          const vol = dailyVolume[d];
          const heightPct = Math.min(100, Math.max(8, (vol / maxVolume) * 100));
          const hasActivity = vol > 0;

          return (
            <View key={d} style={styles.barCol}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${heightPct}%` },
                    hasActivity && { backgroundColor: theme.accent },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  hasActivity && { color: theme.accent, fontWeight: '800' },
                ]}>
                {DAY_SHORT_LABELS[d]}
              </Text>
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
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  unit: {
    fontSize: 14,
  },
  subtext: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 90,
    paddingTop: Spacing.two,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barTrack: {
    width: 14,
    flex: 1,
    backgroundColor: Brand.cardElevated,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 7,
  },
  dayLabel: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
});
