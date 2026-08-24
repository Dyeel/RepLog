import { useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { formatMonthDay } from '@/lib/utils';
import { BodyWeightEntry, WeightUnit } from '@/types';

type BodyweightChartProps = {
  logs: BodyWeightEntry[];
  unit: WeightUnit;
  onOpenLogModal?: () => void;
};

type RangeFilter = '7D' | '14D' | '30D' | 'ALL';

export function BodyweightChart({ logs, unit, onOpenLogModal }: BodyweightChartProps) {
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>('30D');
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  // Filter and sort chronologically (oldest to newest for X-axis)
  const filteredData = useMemo(() => {
    const sorted = [...logs].sort(
      (a, b) => new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime(),
    );

    if (rangeFilter === '7D') return sorted.slice(-7);
    if (rangeFilter === '14D') return sorted.slice(-14);
    if (rangeFilter === '30D') return sorted.slice(-30);
    return sorted;
  }, [logs, rangeFilter]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    const weights = filteredData.map((d) => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const first = filteredData[0].weight;
    const latest = filteredData[filteredData.length - 1].weight;
    const delta = latest - first;
    const avg = weights.reduce((a, b) => a + b, 0) / weights.length;

    return {
      min,
      max,
      first,
      latest,
      delta: Math.round(delta * 10) / 10,
      avg: Math.round(avg * 10) / 10,
    };
  }, [filteredData]);

  if (!stats || filteredData.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconBadge}>
          <Text style={styles.emptyIconText}>⚖️</Text>
        </View>
        <Text style={styles.emptyTitle}>No Bodyweight Data Yet</Text>
        <Text style={styles.emptySubtext}>
          Log your daily scale weigh-in to generate your interactive smooth progression curve.
        </Text>
        {onOpenLogModal && (
          <Pressable onPress={onOpenLogModal} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>+ Log First Weigh-In</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // Chart Dimensions
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(280, screenWidth - Spacing.four * 2 - Spacing.four * 2);
  const chartHeight = 160;
  const paddingLeft = 32;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 26;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const minWeight = stats.min === stats.max ? stats.min - 1 : stats.min - 0.5;
  const maxWeight = stats.min === stats.max ? stats.max + 1 : stats.max + 0.5;
  const weightRange = maxWeight - minWeight;

  // Calculate coordinates for points
  const points = filteredData.map((d, i) => {
    const x =
      filteredData.length === 1
        ? paddingLeft + innerWidth / 2
        : paddingLeft + (i / (filteredData.length - 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((d.weight - minWeight) / weightRange) * innerHeight;
    return { x, y, data: d };
  });

  // Build SVG path (Smooth Bezier Curve)
  let linePath = '';
  let areaPath = '';

  if (points.length === 1) {
    linePath = `M ${points[0].x - 10} ${points[0].y} L ${points[0].x + 10} ${points[0].y}`;
    areaPath = `M ${points[0].x - 10} ${chartHeight - paddingBottom} L ${points[0].x - 10} ${
      points[0].y
    } L ${points[0].x + 10} ${points[0].y} L ${points[0].x + 10} ${chartHeight - paddingBottom} Z`;
  } else {
    // Generate Catmull-Rom or Cubic Bezier path
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

  // Active selected data point
  const selectedPoint =
    activePointIndex !== null && points[activePointIndex]
      ? points[activePointIndex]
      : points[points.length - 1];

  return (
    <View style={styles.card}>
      {/* Top Header Row & Range Filters */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTag}>BODYWEIGHT GRAPH</Text>
          <View style={styles.weightValueRow}>
            <Text style={styles.mainWeightNumber}>{selectedPoint.data.weight}</Text>
            <Text style={styles.mainWeightUnit}>{unit}</Text>
            <Text style={styles.mainWeightDate}>
              · {formatMonthDay(selectedPoint.data.dateKey)}
            </Text>
          </View>
        </View>

        {/* Range Selector Filter Pills */}
        <View style={styles.rangePills}>
          {(['7D', '14D', '30D', 'ALL'] as RangeFilter[]).map((r) => (
            <Pressable
              key={r}
              onPress={() => {
                setRangeFilter(r);
                setActivePointIndex(null);
              }}
              style={[styles.rangePill, rangeFilter === r && styles.rangePillActive]}>
              <Text
                style={[styles.rangePillText, rangeFilter === r && styles.rangePillTextActive]}>
                {r}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Metric Quick Stats Ribbon */}
      <View style={styles.metricsRibbon}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Net Change</Text>
          <Text
            style={[
              styles.metricValue,
              stats.delta > 0
                ? styles.deltaGain
                : stats.delta < 0
                ? styles.deltaLoss
                : styles.deltaNeutral,
            ]}>
            {stats.delta > 0 ? `+${stats.delta}` : stats.delta} {unit}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Min Weight</Text>
          <Text style={styles.metricValue}>
            {stats.min} {unit}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Max Weight</Text>
          <Text style={styles.metricValue}>
            {stats.max} {unit}
          </Text>
        </View>
      </View>

      {/* SVG Smooth Vector Graph */}
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="bwGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={Brand.emerald} stopOpacity="0.35" />
              <Stop offset="70%" stopColor={Brand.emerald} stopOpacity="0.06" />
              <Stop offset="100%" stopColor={Brand.emerald} stopOpacity="0.0" />
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
            {Math.round(maxWeight)}
          </SvgText>
          <SvgText
            x={paddingLeft - 6}
            y={chartHeight - paddingBottom + 3}
            fill={Brand.textMuted}
            fontSize="9"
            fontWeight="700"
            textAnchor="end">
            {Math.round(minWeight)}
          </SvgText>

          {/* Gradient Area Fill */}
          <Path d={areaPath} fill="url(#bwGradient)" />

          {/* Glowing Stroke Curve Line */}
          <Path
            d={linePath}
            fill="none"
            stroke={Brand.emerald}
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
                fill={isSelected ? '#FFFFFF' : Brand.emerald}
                stroke={isSelected ? Brand.emerald : '#050507'}
                strokeWidth={isSelected ? '2.5' : '1.5'}
                onPress={() => setActivePointIndex(idx)}
              />
            );
          })}

          {/* X-Axis Date Labels (First & Last) */}
          {points.length > 0 && (
            <>
              <SvgText
                x={points[0].x}
                y={chartHeight - 6}
                fill={Brand.textMuted}
                fontSize="9"
                fontWeight="700"
                textAnchor="start">
                {formatMonthDay(points[0].data.dateKey)}
              </SvgText>
              {points.length > 1 && (
                <SvgText
                  x={points[points.length - 1].x}
                  y={chartHeight - 6}
                  fill={Brand.textMuted}
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="end">
                  {formatMonthDay(points[points.length - 1].data.dateKey)}
                </SvgText>
              )}
            </>
          )}
        </Svg>
      </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTag: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  weightValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  mainWeightNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  mainWeightUnit: {
    color: Brand.emerald,
    fontSize: 14,
    fontWeight: '800',
  },
  mainWeightDate: {
    color: Brand.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  rangePills: {
    flexDirection: 'row',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.pill,
    padding: 2,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  rangePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  rangePillActive: {
    backgroundColor: Brand.emerald,
  },
  rangePillText: {
    color: Brand.textSecondary,
    fontSize: 10,
    fontWeight: '800',
  },
  rangePillTextActive: {
    color: '#050507',
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
  deltaGain: {
    color: Brand.amber,
  },
  deltaLoss: {
    color: Brand.emerald,
  },
  deltaNeutral: {
    color: Brand.textSecondary,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: Brand.card,
    borderRadius: Radius.xl,
    padding: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.two,
  },
  emptyIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Brand.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIconText: {
    fontSize: 22,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtext: {
    color: Brand.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 17,
  },
  emptyBtn: {
    backgroundColor: Brand.emerald,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    marginTop: Spacing.two,
  },
  emptyBtnText: {
    color: '#050507',
    fontSize: 13,
    fontWeight: '800',
  },
});
