import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Brand } from '@/constants/theme';

type PulsingDotProps = {
  size?: number;
  color?: string;
};

export function PulsingDot({ size = 8, color = Brand.emerald }: PulsingDotProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.6, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.2, { duration: 1000 }), withTiming(0.8, { duration: 1000 })),
      -1,
      true,
    );
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size * 2,
            height: size * 2,
            borderRadius: size,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      />
      <View
        style={[
          styles.coreDot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
  },
  coreDot: {
    zIndex: 1,
  },
});
