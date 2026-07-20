import { Pressable, StyleSheet, View } from 'react-native';

import { TextField } from '@/components/ui/form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { WorkoutSet } from '@/types';

type SetRowProps = {
  set: WorkoutSet;
  index: number;
  onChange: (id: string, field: 'weight' | 'reps', value: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
};

export function SetRow({ set, index, onChange, onRemove, canRemove }: SetRowProps) {
  return (
    <View style={styles.row}>
      <ThemedText type="smallBold" style={styles.setNumber}>
        {index + 1}
      </ThemedText>
      <View style={styles.inputs}>
        <TextField
          label="Weight"
          value={set.weight}
          onChangeText={(value) => onChange(set.id, 'weight', value)}
          placeholder="kg"
          keyboardType="decimal-pad"
        />
        <TextField
          label="Reps"
          value={set.reps}
          onChangeText={(value) => onChange(set.id, 'reps', value)}
          placeholder="reps"
          keyboardType="number-pad"
        />
      </View>
      {canRemove ? (
        <Pressable onPress={() => onRemove(set.id)} style={styles.removeButton}>
          <ThemedText type="small" themeColor="textSecondary">
            Remove
          </ThemedText>
        </Pressable>
      ) : (
        <View style={styles.removePlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  setNumber: {
    width: 20,
    textAlign: 'center',
    paddingBottom: Spacing.two,
  },
  inputs: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  removeButton: {
    paddingBottom: Spacing.two,
    minWidth: 56,
  },
  removePlaceholder: {
    minWidth: 56,
  },
});
