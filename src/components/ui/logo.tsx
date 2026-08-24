import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Brand, Radius } from '@/constants/theme';

type RepLogLogoProps = {
  size?: number;
};

export function RepLogLogo({ size = 120 }: RepLogLogoProps) {
  const iconSize = size * 0.42;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
        },
      ]}>
      <View
        style={[
          styles.glowRing,
          {
            width: size * 0.8,
            height: size * 0.8,
            borderRadius: size * 0.4,
          },
        ]}>
        <View
          style={[
            styles.innerCircle,
            {
              width: size * 0.68,
              height: size * 0.68,
              borderRadius: size * 0.34,
            },
          ]}>
          <MaterialCommunityIcons name="dumbbell" size={iconSize} color={Brand.emerald} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    shadowColor: Brand.emerald,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  glowRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E1017',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
});
