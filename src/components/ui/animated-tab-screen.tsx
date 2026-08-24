import { useIsFocused } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type AnimatedTabScreenProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedTabScreen({ children, style }: AnimatedTabScreenProps) {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(0.4);
  const translateY = useSharedValue(10);

  useEffect(() => {
    if (isFocused) {
      opacity.value = 0.3;
      translateY.value = 8;
      opacity.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withTiming(0, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [isFocused, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
