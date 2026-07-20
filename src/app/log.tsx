import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseAutocomplete } from '@/components/exercise-autocomplete';
import { SetRow } from '@/components/set-row';
import { PrimaryButton, ScreenHeader, TextField } from '@/components/ui/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { generateId } from '@/lib/utils';
import { WorkoutSet } from '@/types';

function createEmptySet(): WorkoutSet {
  return { id: generateId(), weight: '', reps: '' };
}

export default function LogWorkoutScreen() {
  const { isReady, addLog } = useWorkoutStore();
  const [exerciseName, setExerciseName] = useState('');
  const [note, setNote] = useState('');
  const [sets, setSets] = useState<WorkoutSet[]>([createEmptySet()]);
  const [saving, setSaving] = useState(false);

  const updateSet = (id: string, field: 'weight' | 'reps', value: string) => {
    setSets((current) =>
      current.map((set) => (set.id === id ? { ...set, [field]: value } : set)),
    );
  };

  const addSet = () => {
    setSets((current) => [...current, createEmptySet()]);
  };

  const removeSet = (id: string) => {
    setSets((current) => (current.length > 1 ? current.filter((set) => set.id !== id) : current));
  };

  const handleSave = async () => {
    const trimmedName = exerciseName.trim();
    if (!trimmedName) {
      Alert.alert('Missing exercise', 'Enter an exercise name before saving.');
      return;
    }

    const validSets = sets.filter((set) => set.weight.trim() || set.reps.trim());
    if (validSets.length === 0) {
      Alert.alert('Missing sets', 'Add at least one set with weight or reps.');
      return;
    }

    setSaving(true);
    try {
      await addLog({
        exerciseName: trimmedName,
        sets: validSets,
        note: note.trim() || undefined,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  if (!isReady) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.topBar}>
              <Pressable onPress={() => router.back()}>
                <ThemedText type="linkPrimary">Cancel</ThemedText>
              </Pressable>
            </View>

            <ScreenHeader title="Log Workout" subtitle="Record sets and reps for an exercise" />

            <ExerciseAutocomplete value={exerciseName} onChangeText={setExerciseName} />

            <View style={styles.setsSection}>
              <ThemedText type="smallBold">Sets</ThemedText>
              {sets.map((set, index) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={index}
                  onChange={updateSet}
                  onRemove={removeSet}
                  canRemove={sets.length > 1}
                />
              ))}
              <Pressable onPress={addSet}>
                <ThemedText type="linkPrimary">+ Add set</ThemedText>
              </Pressable>
            </View>

            <TextField
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder='e.g. "felt strong today"'
              multiline
            />

            <PrimaryButton
              label={saving ? 'Saving...' : 'Save workout'}
              onPress={handleSave}
              disabled={saving}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  topBar: {
    alignItems: 'flex-start',
  },
  setsSection: {
    gap: Spacing.three,
  },
});
