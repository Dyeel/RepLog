import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { ExerciseThumbnail } from '@/components/ui';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { calculate1RM, formatMonthDay } from '@/lib/utils';
import { WeightUnit, WorkoutLog } from '@/types';

type StrengthProgressionChartProps = {
  logs: WorkoutLog[];
  unit: WeightUnit;
};

export function StrengthProgressionChart({ logs, unit }: StrengthProgressionChartProps) {
  const theme = useTheme();
  // Extract all distinct exercise names that have logged sets
  const availableExercises = useMemo(() => {
    const names = new Set<string>();
    logs.forEach((l) => {
      if (l.sets.some((s) => s.weight && s.reps)) {
        names.add(l.exerciseName);
      }
    });
    return Array.from(names);
  }, [logs]);

  const [selectedExercise, setSelectedExercise] = useState<string>(
    availableExercises[0] || 'Barbell Bench Press',
  );
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  // Compute 1RM history per session date for the selected exercise
  const historyData = useMemo(() => {
    const matchedLogs = logs
      .filter((l) => l.exerciseName.toLowerCase() === selectedExercise.toLowerCase())
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return matchedLogs
      .map((log) => {
        let max1RM = 0;
        let peakWeight = 0;
        log.sets.forEach((set) => {
          const w = parseFloat(set.weight) || 0;
          const r = parseInt(set.reps, 10) || 0;
          if (w > 0 && r > 0) {
            const calculated = calculate1RM(w, r);
            if (calculated > max1RM) max1RM = calculated;
            if (w > peakWeight) peakWeight = w;
          }
        });

        return {
          id: log.id,
          date: log.timestamp,
          peakWeight,
          max1RM,
        };
      })
      .filter((item) => item.max1RM > 0);
  }, [logs, selectedExercise]);

  if (availableExercises.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTag}>LIFT STRENGTH GRAPH (1RM)</Text>
        </View>
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="trophy-outline" size={32} color={Brand.textMuted} />
          <Text style={styles.emptyText}>No Exercise Logs Available</Text>
          <Text style={styles.emptySubtext}>
            Log sets in a workout session to unlock your estimated 1RM progressive overload graph.
          </Text>
        </View>
      </View>
    );
  }

  // Dimensions
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(280, screenWidth - Spacing.four * 2 - Spacing.four * 2);
  const chartHeight = 150;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 26;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const values = historyData.map((d) => d.max1RM);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 100;

  const minScale = minVal === maxVal ? Math.max(0, minVal - 10) : Math.max(0, minVal - 5);
  const maxScale = minVal === maxVal ? maxVal + 10 : maxVal + 5;
  const range = maxScale - minScale || 1;

  // Calculate coordinates
  const points = historyData.map((d, i) => {
    const x =
      historyData.length === 1
        ? paddingLeft + innerWidth / 2
        : paddingLeft + (i / (historyData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((d.max1RM - minScale) / range) * innerHeight;
    return { x, y, data: d };
  });

  // SVG Bezier Curve
  let linePath = '';
  let areaPath = '';

  if (points.length === 1) {
    linePath = `M ${points[0].x - 10} ${points[0].y} L ${points[0].x + 10} ${points[0].y}`;
    areaPath = `M ${points[0].x - 10} ${chartHeight - paddingBottom} L ${points[0].x - 10} ${
      points[0].y
    } L ${points[0].x + 10} ${points[0].y} L ${points[0].x + 10} ${chartHeight - paddingBottom} Z`;
  } else if (points.length > 1) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    areaPath = `${linePath} L ${lastPt.x} ${chartHeight - paddingBottom} L ${firstPt.x} ${
      chartHeight - paddingBottom
    } Z`;
  }

  const selectedPoint =
    activePointIndex !== null && points[activePointIndex]
      ? points[activePointIndex]
      : points[points.length - 1] || null;

  const current1RM = selectedPoint ? Math.round(selectedPoint.data.max1RM) : 0;
  const bestAllTime = values.length > 0 ? Math.round(Math.max(...values)) : 0;
  const first1RM = values.length > 0 ? values[0] : 0;
  const totalGain = Math.round((current1RM - first1RM) * 10) / 10;

  return (
    <View style={styles.card}>
      {/* Card Header & Title */}
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <ExerciseThumbnail exerciseName={selectedExercise} size={28} />
          <Text style={styles.exerciseTitle} numberOfLines={1}>
            {selectedExercise}
          </Text>
        </View>

        <View style={styles.current1RMBox}>
          <Text style={styles.current1RMValue}>
            {current1RM} <Text style={[styles.unitText, { color: theme.accent }]}>{unit}</Text>
          </Text>
          <Text style={styles.current1RMLabel}>
            {selectedPoint
              ? `${formatMonthDay(selectedPoint.data.date)} EST. 1RM`
              : 'ESTIMATED 1RM'}
          </Text>
        </View>
      </View>

      {/* Horizontal Exercise Selector Pills */}
      {availableExercises.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}>
          {availableExercises.map((name) => {
            const isSelected = name.toLowerCase() === selectedExercise.toLowerCase();
            return (
              <Pressable
                key={name}
                onPress={() => {
                  setSelectedExercise(name);
                  setActivePointIndex(null);
                }}
                style={[
                  styles.pill,
                  isSelected && [
                    styles.pillActive,
                    { backgroundColor: theme.accent, borderColor: theme.accent },
                  ],
                ]}>
                <Text
                  style={[
                    styles.pillText,
                    isSelected && styles.pillTextActive,
                  ]}>
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Metrics Ribbon */}
      {values.length > 0 && (
        <View style={styles.metricsRibbon}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>All-Time Best</Text>
            <Text style={styles.metricValue}>
              {bestAllTime} {unit}
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Entries</Text>
            <Text style={styles.metricValue}>{historyData.length} logs</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Progression</Text>
            <Text
              style={[
                styles.metricValue,
                totalGain > 0
                  ? { color: theme.accent }
                  : totalGain < 0
                  ? styles.gainNegative
                  : styles.gainNeutral,
              ]}>
              {totalGain > 0 ? `+${totalGain}` : totalGain} {unit}
            </Text>
          </View>
        </View>
      )}

      {/* SVG Smooth Curve Graph */}
      {points.length > 0 ? (
        <View style={styles.chartWrapper}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              <LinearGradient id="strGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={theme.accent} stopOpacity="0.30" />
                <Stop offset="80%" stopColor={theme.accent} stopOpacity="0.05" />
                <Stop offset="100%" stopColor={theme.accent} stopOpacity="0.0" />
              </LinearGradient>
            </Defs>

            {/* Grid Horizontal Guidelines */}
            <Line
              x1={paddingLeft}
              y1={paddingTop}
              x2={chartWidth - paddingRight}
              y2={paddingTop}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <Line
              x1={paddingLeft}
              y1={paddingTop + innerHeight / 2}
              x2={chartWidth - paddingRight}
              y2={paddingTop + innerHeight / 2}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <Line
              x1={paddingLeft}
              y1={chartHeight - paddingBottom}
              x2={chartWidth - paddingRight}
              y2={chartHeight - paddingBottom}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />

            {/* Y-Axis Labels */}
            <SvgText
              x={paddingLeft - 6}
              y={paddingTop + 4}
              fill={Brand.textMuted}
              fontSize="9"
              fontWeight="700"
              textAnchor="end">
              {Math.round(maxScale)}
            </SvgText>
            <SvgText
              x={paddingLeft - 6}
              y={chartHeight - paddingBottom + 3}
              fill={Brand.textMuted}
              fontSize="9"
              fontWeight="700"
              textAnchor="end">
              {Math.round(minScale)}
            </SvgText>

            {/* Gradient Area Fill */}
            <Path d={areaPath} fill="url(#strGradient)" />

            {/* Glowing Stroke Curve Line */}
            <Path
              d={linePath}
              fill="none"
              stroke={theme.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {points.map((pt, idx) => {
              const isSelected = selectedPoint === pt;
              return (
                <Circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? '5.5' : '3.5'}
                  fill={isSelected ? '#FFFFFF' : theme.accent}
                  stroke={isSelected ? theme.accent : '#050507'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  onPress={() => setActivePointIndex(idx)}
                />
              );
            })}

            {/* X-Axis Dates */}
            {points.length > 1 && (
              <>
                <SvgText
                  x={paddingLeft}
                  y={chartHeight - 6}
                  fill={Brand.textMuted}
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="start">
                  {formatMonthDay(points[0].data.date)}
                </SvgText>
                <SvgText
                  x={chartWidth - paddingRight}
                  y={chartHeight - 6}
                  fill={Brand.textMuted}
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="end">
                  {formatMonthDay(points[points.length - 1].data.date)}
                </SvgText>
              </>
            )}
          </Svg>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptySubtext}>
            Add weight & reps for {selectedExercise} to chart strength progression.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleCol: {
    gap: 4,
    flex: 1,
  },
  cardTag: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  exerciseTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  current1RMBox: {
    alignItems: 'flex-end',
    gap: 1,
  },
  current1RMValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  unitText: {
    color: Brand.emerald,
    fontSize: 13,
    fontWeight: '700',
  },
  current1RMLabel: {
    color: Brand.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pillsScroll: {
    gap: Spacing.one,
    paddingVertical: 2,
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Brand.cardElevated,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  pillActive: {
    backgroundColor: Brand.emerald,
    borderColor: Brand.emerald,
  },
  pillText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#050507',
    fontWeight: '800',
  },
  metricsRibbon: {
    flexDirection: 'row',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricLabel: {
    color: Brand.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  gainPositive: {
    color: Brand.emerald,
  },
  gainNegative: {
    color: Brand.danger,
  },
  gainNeutral: {
    color: Brand.textSecondary,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    gap: 4,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptySubtext: {
    color: Brand.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 17,
  },
});
