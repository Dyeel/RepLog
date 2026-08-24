import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { MUSCLE_GROUPS } from '@/lib/exercise-library';

type ExerciseAutocompleteProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function ExerciseAutocomplete({ value, onChangeText }: ExerciseAutocompleteProps) {
  const { allExercises, getExerciseSuggestions } = useWorkoutStore();
  const [focused, setFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const suggestions = useMemo(() => {
    if (value.trim()) {
      return getExerciseSuggestions(value);
    }
    if (selectedCategory !== 'All') {
      return allExercises
        .filter((e) => e.category === selectedCategory)
        .map((e) => e.name);
    }
    return getExerciseSuggestions('');
  }, [allExercises, getExerciseSuggestions, selectedCategory, value]);

  const showSuggestions = focused || !value.trim();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>EXERCISE</Text>

      {/* Input Field */}
      <View style={[styles.inputBox, focused && styles.inputBoxFocused]}>
        <MaterialCommunityIcons
          name="dumbbell"
          size={20}
          color={focused ? Brand.emerald : Brand.textMuted}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          placeholder="e.g. Barbell Bench Press"
          placeholderTextColor={Brand.textMuted}
          autoCapitalize="words"
          style={styles.input}
        />
        {value ? (
          <Pressable onPress={() => onChangeText('')} style={styles.clearBtn}>
            <MaterialCommunityIcons name="close-circle" size={18} color={Brand.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoriesRow}>
        {['All', ...MUSCLE_GROUPS].map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <Pressable
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={({ pressed }) => [
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
                pressed && styles.pressed,
              ]}>
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextActive,
                ]}>
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Suggestions List */}
      {showSuggestions && suggestions.length > 0 ? (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions.slice(0, 6)}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChangeText(item);
                  setFocused(false);
                }}
                style={({ pressed }) => [styles.suggestionRow, pressed && styles.suggestionPressed]}>
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  size={16}
                  color={Brand.emerald}
                  style={styles.suggestionIcon}
                />
                <Text style={styles.suggestionText}>{item}</Text>
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
    gap: Spacing.two,
    zIndex: 20,
  },
  label: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.card,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Brand.cardBorder,
    paddingHorizontal: Spacing.three,
    height: 52,
    gap: Spacing.two,
  },
  inputBoxFocused: {
    borderColor: Brand.emerald,
    backgroundColor: Brand.cardElevated,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearBtn: {
    padding: 4,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  categoryChipActive: {
    backgroundColor: Brand.emeraldMuted,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  categoryText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: Brand.emerald,
  },
  suggestionsContainer: {
    backgroundColor: Brand.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  suggestionIcon: {
    marginRight: Spacing.two,
  },
  suggestionText: {
    color: Brand.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionPressed: {
    backgroundColor: Brand.cardElevated,
  },
  pressed: {
    opacity: 0.8,
  },
});
