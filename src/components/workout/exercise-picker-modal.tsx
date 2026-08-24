import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ExerciseThumbnail } from '@/components/ui';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { MUSCLE_GROUPS } from '@/lib/exercise-library';
import { ExerciseDefinition, MuscleGroup } from '@/types';

type ExercisePickerModalProps = {
  visible: boolean;
  onSelectExercise: (exercise: ExerciseDefinition) => void;
  onClose: () => void;
};

export function ExercisePickerModal({
  visible,
  onSelectExercise,
  onClose,
}: ExercisePickerModalProps) {
  const { allExercises, addCustomExercise } = useWorkoutStore();
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [customName, setCustomName] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  const filteredExercises = useMemo(() => {
    return allExercises.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchMuscle = selectedMuscle === 'All' || item.category === selectedMuscle;
      return matchSearch && matchMuscle;
    });
  }, [allExercises, search, selectedMuscle]);

  const handleCreateCustom = async () => {
    if (!customName.trim()) return;
    const muscle: MuscleGroup =
      selectedMuscle !== 'All' ? (selectedMuscle as MuscleGroup) : 'Chest';
    const created = await addCustomExercise(customName, muscle);
    setCustomName('');
    setIsCreatingCustom(false);
    onSelectExercise(created);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>EXERCISE LIBRARY</Text>
              <Text style={styles.subtitle}>Select exercise to add to workout</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Brand.textSecondary} />
            </Pressable>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color={Brand.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search 60+ exercises..."
              placeholderTextColor={Brand.textMuted}
              style={styles.searchInput}
            />
            {search ? (
              <Pressable onPress={() => setSearch('')} style={styles.clearBtn}>
                <MaterialCommunityIcons name="close-circle" size={18} color={Brand.textMuted} />
              </Pressable>
            ) : null}
          </View>

          {/* Muscle Group Filter Tabs */}
          <View style={styles.categoriesStrip}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['All', ...MUSCLE_GROUPS]}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.categoriesList}
              renderItem={({ item }) => {
                const isActive = selectedMuscle === item;
                return (
                  <Pressable
                    onPress={() => setSelectedMuscle(item)}
                    style={[styles.categoryPill, isActive && styles.categoryPillActive]}>
                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* Custom Exercise Creator Toggle */}
          {isCreatingCustom ? (
            <View style={styles.customBox}>
              <Text style={styles.customTitle}>Create Custom Exercise</Text>
              <TextInput
                value={customName}
                onChangeText={setCustomName}
                placeholder="e.g. Incline Smith Machine Press"
                placeholderTextColor={Brand.textMuted}
                style={styles.customInput}
                autoFocus
              />
              <View style={styles.customActionRow}>
                <Pressable
                  onPress={() => setIsCreatingCustom(false)}
                  style={styles.cancelCustomBtn}>
                  <Text style={styles.cancelCustomText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleCreateCustom} style={styles.saveCustomBtn}>
                  <Text style={styles.saveCustomText}>Add & Select</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setIsCreatingCustom(true)}
              style={styles.createCustomTrigger}>
              <MaterialCommunityIcons name="plus" size={18} color={Brand.emerald} />
              <Text style={styles.createCustomTriggerText}>Create Custom Exercise</Text>
            </Pressable>
          )}

          {/* Exercises List with Thumbnails */}
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelectExercise(item);
                  onClose();
                }}
                style={({ pressed }) => [styles.exerciseRow, pressed && styles.rowPressed]}>
                <View style={styles.exerciseLeft}>
                  <ExerciseThumbnail
                    exerciseName={item.name}
                    imageUrl={item.imageUrl}
                    category={item.category}
                    size={48}
                  />

                  <View style={styles.exerciseMeta}>
                    <Text style={styles.exerciseName}>{item.name}</Text>
                    <Text style={styles.exerciseCategory}>{item.category.toUpperCase()}</Text>
                  </View>
                </View>

                <MaterialCommunityIcons name="plus-circle-outline" size={22} color={Brand.emerald} />
              </Pressable>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Brand.cardBorder,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
    borderRadius: Radius.sm,
    backgroundColor: Brand.card,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 48,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  clearBtn: {
    padding: 4,
  },
  categoriesStrip: {
    height: 36,
  },
  categoriesList: {
    gap: Spacing.one,
  },
  categoryPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  categoryPillActive: {
    backgroundColor: Brand.emeraldMuted,
    borderColor: Brand.emerald,
  },
  categoryText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: Brand.emerald,
  },
  createCustomTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  createCustomTriggerText: {
    color: Brand.emerald,
    fontSize: 13,
    fontWeight: '700',
  },
  customBox: {
    backgroundColor: Brand.card,
    borderRadius: Radius.md,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.two,
  },
  customTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  customInput: {
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    height: 42,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  customActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  cancelCustomBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
  },
  cancelCustomText: {
    color: Brand.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  saveCustomBtn: {
    backgroundColor: Brand.emerald,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  saveCustomText: {
    color: '#050507',
    fontSize: 13,
    fontWeight: '800',
  },
  listContent: {
    gap: Spacing.one,
    paddingBottom: Spacing.six,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.card,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  rowPressed: {
    backgroundColor: Brand.cardElevated,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    flex: 1,
  },
  exerciseMeta: {
    gap: 2,
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  exerciseCategory: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
