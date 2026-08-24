import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Radius, Spacing } from '@/constants/theme';

const PRESETS = [30, 60, 90, 120, 180];

export function RestTimer() {
  const [targetSeconds, setTargetSeconds] = useState(90);
  const [secondsRemaining, setSecondsRemaining] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const startPreset = (seconds: number) => {
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

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsRemaining(targetSeconds);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
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
          <View style={[styles.timerIconBadge, isRunning && styles.timerIconBadgeActive]}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={16}
              color={isRunning ? Brand.emerald : Brand.textSecondary}
            />
          </View>

          <View>
            <Text style={styles.title}>REST INTERVAL</Text>
            <Text style={styles.timerDisplay}>
              {formatTime(secondsRemaining)} {isRunning && <Text style={styles.runningDot}>●</Text>}
            </Text>
          </View>
        </Pressable>

        {/* Quick play/pause controls */}
        <View style={styles.headerRight}>
          <Pressable
            onPress={togglePlayPause}
            style={({ pressed }) => [
              styles.controlBtn,
              isRunning ? styles.pauseBtn : styles.playBtn,
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
              size={18}
              color={Brand.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {/* Progress Line */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Expanded Preset Selectors */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.presetLabel}>Select Rest Duration:</Text>
          <View style={styles.presetsRow}>
            {PRESETS.map((seconds) => {
              const isSelected = targetSeconds === seconds;
              return (
                <Pressable
                  key={seconds}
                  onPress={() => startPreset(seconds)}
                  style={({ pressed }) => [
                    styles.presetPill,
                    isSelected && styles.presetPillActive,
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[
                      styles.presetPillText,
                      isSelected && styles.presetPillTextActive,
                    ]}>
                    {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable onPress={resetTimer} style={styles.resetPill}>
              <MaterialCommunityIcons name="restart" size={14} color={Brand.textMuted} />
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
