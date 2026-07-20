import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { useTheme } from '@/hooks/use-theme';

type ExerciseAutocompleteProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function ExerciseAutocomplete({ value, onChangeText }: ExerciseAutocompleteProps) {
  const theme = useTheme();
  const { getExerciseSuggestions } = useWorkoutStore();
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(
    () => getExerciseSuggestions(value),
    [getExerciseSuggestions, value],
  );

  const showSuggestions = focused && suggestions.length > 0;

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold">Exercise</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="e.g. Bench Press"
        placeholderTextColor={theme.textSecondary}
        autoCapitalize="words"
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: theme.backgroundSelected,
          },
        ]}
      />
      {showSuggestions ? (
        <View
          style={[
            styles.suggestions,
            { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
          ]}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChangeText(item);
                  setFocused(false);
                }}
                style={({ pressed }) => [styles.suggestionRow, pressed && styles.pressed]}>
                <ThemedText>{item}</ThemedText>
              </Pressable>
            )}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
    zIndex: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  suggestions: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    maxHeight: 180,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
