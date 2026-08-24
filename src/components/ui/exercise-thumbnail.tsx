import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

import { Brand, Radius } from '@/constants/theme';
import { getExerciseImage, getExerciseMuscleGroup } from '@/lib/exercise-library';
import { MuscleGroup } from '@/types';

type ExerciseThumbnailProps = {
  exerciseName: string;
  imageUrl?: string;
  category?: MuscleGroup;
  size?: number;
  style?: ViewStyle;
};

export function ExerciseThumbnail({
  exerciseName,
  imageUrl,
  category,
  size = 52,
  style,
}: ExerciseThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = imageUrl || getExerciseImage(exerciseName);
  const resolvedCategory = category || getExerciseMuscleGroup(exerciseName);

  const getMuscleIcon = () => {
    switch (resolvedCategory) {
      case 'Chest':
        return 'shield-outline';
      case 'Back':
        return 'human';
      case 'Legs':
        return 'run-fast';
      case 'Shoulders':
        return 'arrow-collapse-up';
      case 'Arms':
        return 'arm-flex-outline';
      case 'Core':
        return 'circle-slice-8';
      default:
        return 'dumbbell';
    }
  };

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: Radius.md },
        style,
      ]}>
      {resolvedUrl && !hasError ? (
        <Image
          source={{ uri: resolvedUrl }}
          style={[styles.image, { width: size - 4, height: size - 4, borderRadius: Radius.sm }]}
          resizeMode="contain"
          onError={() => setHasError(true)}
        />
      ) : (
        <View style={styles.fallback}>
          <MaterialCommunityIcons
            name={getMuscleIcon() as any}
            size={Math.round(size * 0.45)}
            color={Brand.textSecondary}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    backgroundColor: '#FFFFFF',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.cardElevated,
    width: '100%',
    height: '100%',
  },
});
