import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDate } from '@/lib/utils';
import { WorkoutLog } from '@/types';

type WorkoutLogCardProps = {
  log: WorkoutLog;
  onPress?: () => void;
};

export function WorkoutLogCard({ log, onPress }: WorkoutLogCardProps) {
  const setsSummary = log.sets
    .map((set) => `${set.weight || '0'}kg × ${set.reps || '0'}`)
    .join(' · ');

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <ThemedText type="smallBold">{log.exerciseName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatDate(log.timestamp)}
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
        {setsSummary}
      </ThemedText>
      {log.note ? (
        <ThemedText type="small" numberOfLines={1}>
          {log.note}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
