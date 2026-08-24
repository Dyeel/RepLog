import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing, getSplitBadgeColor } from '@/constants/theme';
import { WeightUnit } from '@/types';

type RecentSessionCardProps = {
  title: string;
  subtitle: string;
  exerciseCount?: number;
  totalSets?: number;
  totalVolume?: number;
  unit?: WeightUnit;
  onPress?: () => void;
  onDelete?: () => void;
};

export function RecentSessionCard({
  title,
  subtitle,
  exerciseCount,
  totalSets,
  totalVolume,
  unit = 'kg',
  onPress,
  onDelete,
}: RecentSessionCardProps) {
  const badgeStyle = getSplitBadgeColor(title);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.content}>
        {/* Top line with title and date */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border },
            ]}>
            <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{title}</Text>
          </View>
          <Text style={styles.dateLabel}>{subtitle}</Text>
        </View>

        {/* Stats metrics */}
        <View style={styles.statsRow}>
          {exerciseCount !== undefined && (
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="dumbbell" size={14} color={Brand.textMuted} />
              <Text style={styles.statText}>{exerciseCount} Movements</Text>
            </View>
          )}

          {totalSets !== undefined && (
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="repeat" size={14} color={Brand.textMuted} />
              <Text style={styles.statText}>{totalSets} Sets</Text>
            </View>
          )}

          {totalVolume !== undefined && totalVolume > 0 && (
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="weight-kilogram" size={14} color={Brand.textMuted} />
              <Text style={styles.statText}>
                {totalVolume.toLocaleString()} {unit}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rightActions}>
        {onDelete && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={styles.deleteBtn}>
            <MaterialCommunityIcons name="trash-can-outline" size={16} color={Brand.danger} />
          </Pressable>
        )}
        <MaterialCommunityIcons name="chevron-right" size={22} color={Brand.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  cardPressed: {
    backgroundColor: Brand.cardElevated,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ scale: 0.99 }],
  },
  content: {
    gap: Spacing.two,
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateLabel: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: Radius.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
});
