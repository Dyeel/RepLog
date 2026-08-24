import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams, router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExerciseThumbnail } from '@/components/ui';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/context/workout-store';
import { formatDateTime, formatSetLine } from '@/lib/utils';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isReady, logs } = useWorkoutStore();
  const log = logs.find((entry) => entry.id === id);

  if (!isReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Brand.emerald} />
      </View>
    );
  }

  if (!log) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFound}>
            <MaterialCommunityIcons name="alert-circle-outline" size={44} color={Brand.textMuted} />
            <Text style={styles.notFoundTitle}>Log Not Found</Text>
            <Text style={styles.notFoundMessage}>This workout log no longer exists.</Text>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Return</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.date}>{formatDateTime(log.timestamp)}</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <ExerciseThumbnail
                exerciseName={log.exerciseName}
                imageUrl={log.imageUrl}
                category={log.category}
                size={54}
              />
              <View style={styles.headerText}>
                <Text style={styles.exerciseName}>{log.exerciseName}</Text>
                {log.category && (
                  <Text style={styles.categoryTag}>{log.category.toUpperCase()}</Text>
                )}
              </View>
            </View>

            <View style={styles.setsList}>
              {log.sets.map((set, index) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={styles.setIndex}>Set {index + 1}</Text>
                  <Text style={styles.setValue}>
                    {formatSetLine(set.weight, set.reps, set.unit ?? log.unit)}
                  </Text>
                </View>
              ))}
            </View>

            {log.note ? (
              <View style={styles.noteBox}>
                <MaterialCommunityIcons name="note-text-outline" size={14} color={Brand.textMuted} />
                <Text style={styles.noteText}>{log.note}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Brand.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  date: {
    color: Brand.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  placeholder: {
    width: 38,
  },
  card: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    gap: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerText: {
    gap: 2,
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  categoryTag: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  setsList: {
    gap: Spacing.two,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  setIndex: {
    color: Brand.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  setValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Brand.cardElevated,
    borderRadius: Radius.sm,
    padding: Spacing.two,
  },
  noteText: {
    color: Brand.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  notFoundTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  notFoundMessage: {
    color: Brand.textSecondary,
    fontSize: 13,
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    marginTop: Spacing.two,
  },
  backBtnText: {
    color: '#050507',
    fontSize: 13,
    fontWeight: '800',
  },
});
