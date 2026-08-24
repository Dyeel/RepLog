import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabConfig = {
  name: string;
  label: string;
  activeIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  inactiveIcon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const TAB_CONFIGS: Record<string, TabConfig> = {
  index: {
    name: 'index',
    label: 'Today',
    activeIcon: 'home',
    inactiveIcon: 'home-outline',
  },
  schedule: {
    name: 'schedule',
    label: 'Schedule',
    activeIcon: 'calendar-month',
    inactiveIcon: 'calendar-clock-outline',
  },
  calculator: {
    name: 'calculator',
    label: 'Calculator',
    activeIcon: 'calculator',
    inactiveIcon: 'calculator-variant-outline',
  },
  history: {
    name: 'history',
    label: 'History',
    activeIcon: 'history',
    inactiveIcon: 'history',
  },
  profile: {
    name: 'profile',
    label: 'Profile',
    activeIcon: 'account-circle',
    inactiveIcon: 'account-circle-outline',
  },
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter(
    (route) => TAB_CONFIGS[route.name] && (descriptors[route.key]?.options as any)?.href !== null,
  );

  return (
    <View
      style={[
        styles.outerContainer,
        {
          paddingBottom:
            Platform.OS === 'web'
              ? 10
              : Math.max(insets.bottom, 8),
        },
      ]}>
      <View
        style={[
          styles.tabBarCard,
          {
            borderColor: `${theme.accent}30`,
            shadowColor: theme.accent,
          },
        ]}>
        {visibleRoutes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIGS[route.name];
          if (!config) return null;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={config.label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tabItem,
                isFocused && [
                  styles.tabItemActive,
                  {
                    backgroundColor: `${theme.accent}14`,
                    borderColor: `${theme.accent}35`,
                  },
                ],
                pressed && styles.tabItemPressed,
              ]}>
              {/* Active illuminated top micro indicator dot/line */}
              {isFocused ? (
                <View
                  style={[
                    styles.activeTopDot,
                    {
                      backgroundColor: theme.accent,
                      shadowColor: theme.accent,
                    },
                  ]}
                />
              ) : (
                <View style={styles.topDotPlaceholder} />
              )}

              {/* Tab Icon */}
              <MaterialCommunityIcons
                name={isFocused ? config.activeIcon : config.inactiveIcon}
                size={22}
                color={isFocused ? theme.accent : Brand.textSecondary}
              />

              {/* Tab Label */}
              <Text
                style={[
                  styles.tabLabel,
                  isFocused
                    ? [styles.tabLabelActive, { color: theme.accent }]
                    : styles.tabLabelInactive,
                ]}
                numberOfLines={1}>
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.three,
    paddingTop: 4,
  },
  tabBarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1015',
    borderRadius: Radius.xl,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 3,
    position: 'relative',
  },
  tabItemActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  tabItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  activeTopDot: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  topDotPlaceholder: {
    width: 14,
    height: 3,
  },
  tabLabel: {
    fontSize: 10.5,
    letterSpacing: -0.1,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  tabLabelInactive: {
    color: Brand.textSecondary,
    fontWeight: '600',
  },
});
