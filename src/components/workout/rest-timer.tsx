import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RestTimerProps = {
  defaultSeconds?: number;
  onTimerComplete?: () => void;
};

const PRESETS = [30, 60, 90, 120, 180];

export function RestTimer({ defaultSeconds = 90, onTimerComplete }: RestTimerProps) {
  const theme = useTheme();
  const [targetSeconds, setTargetSeconds] = useState(defaultSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (onTimerComplete) onTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, onTimerComplete]);

  const handleSetPreset = (seconds: number) => {
    setTargetSeconds(seconds);
    setSecondsRemaining(seconds);
    setIsRunning(true);
  };

  const togglePlayPause = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(targetSeconds);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(targetSeconds);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const remainder = totalSecs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const progress = targetSeconds > 0 ? (targetSeconds - secondsRemaining) / targetSeconds : 0;

  return (
    <View style={styles.container}>
      {/* Header bar / collapsed view */}
      <View style={styles.header}>
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          style={({ pressed }) => [styles.headerLeft, pressed && styles.pressed]}>
          <View
            style={[
              styles.timerIconBadge,
              isRunning && [
                styles.timerIconBadgeActive,
                { backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}40` },
              ],
            ]}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={16}
              color={isRunning ? theme.accent : Brand.textSecondary}
            />
          </View>

          <View>
            <Text style={styles.title}>REST INTERVAL</Text>
            <Text style={styles.timerDisplay}>
              {formatTime(secondsRemaining)}{' '}
              {isRunning && <Text style={[styles.runningDot, { color: theme.accent }]}>●</Text>}
            </Text>
          </View>
        </Pressable>

        {/* Quick play/pause controls */}
        <View style={styles.headerRight}>
          <Pressable
            onPress={togglePlayPause}
            style={({ pressed }) => [
              styles.controlBtn,
              isRunning
                ? styles.pauseBtn
                : [styles.playBtn, { backgroundColor: theme.accent }],
              pressed && styles.pressed,
            ]}>
            <MaterialCommunityIcons
              name={isRunning ? 'pause' : 'play'}
              size={18}
              color={isRunning ? '#FFFFFF' : '#08090C'}
            />
          </Pressable>

          <Pressable
            onPress={() => setIsExpanded(!isExpanded)}
            style={({ pressed }) => [styles.expandBtn, pressed && styles.pressed]}>
            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Brand.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* Progress Bar Indicator */}
      {isRunning && (
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress * 100}%`, backgroundColor: theme.accent },
            ]}
          />
        </View>
      )}

      {/* Expanded Preset Selector */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.presetLabel}>Quick Select Rest Duration:</Text>
          <View style={styles.presetsRow}>
            {PRESETS.map((seconds) => {
              const isActive = targetSeconds === seconds;
              return (
                <Pressable
                  key={seconds}
                  onPress={() => handleSetPreset(seconds)}
                  style={({ pressed }) => [
                    styles.presetPill,
                    isActive && [
                      styles.presetPillActive,
                      { backgroundColor: `${theme.accent}15`, borderColor: theme.accent },
                    ],
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[
                      styles.presetPillText,
                      isActive && [styles.presetPillTextActive, { color: theme.accent }],
                    ]}>
                    {seconds >= 60 ? `${seconds / 60}m` : `${seconds}s`}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={handleReset}
              style={({ pressed }) => [styles.resetPill, pressed && styles.pressed]}>
              <MaterialCommunityIcons name="refresh" size={14} color={Brand.textSecondary} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  timerIconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Brand.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerIconBadgeActive: {
    backgroundColor: Brand.emeraldMuted,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  title: {
    color: Brand.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  timerDisplay: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  runningDot: {
    color: Brand.emerald,
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    backgroundColor: Brand.emerald,
  },
  pauseBtn: {
    backgroundColor: '#334155',
  },
  expandBtn: {
    padding: 6,
  },
  progressBarBg: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    width: '100%',
  },
  progressBarFill: {
    height: 2,
    backgroundColor: Brand.emerald,
  },
  expandedContent: {
    padding: Spacing.three,
    backgroundColor: Brand.cardElevated,
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  presetLabel: {
    color: Brand.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  presetPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Brand.card,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  presetPillActive: {
    backgroundColor: Brand.emeraldMuted,
    borderColor: Brand.emerald,
  },
  presetPillText: {
    color: Brand.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  presetPillTextActive: {
    color: Brand.emerald,
  },
  resetPill: {
    padding: 8,
    borderRadius: Radius.sm,
    backgroundColor: Brand.card,
  },
  pressed: {
    opacity: 0.8,
  },
});
