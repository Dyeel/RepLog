import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Platform } from 'react-native';

import { Brand } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Brand.card,
          borderTopColor: Brand.cardBorder,
          borderTopWidth: 1,
          elevation: 0,
          height: Platform.select({ ios: 84, default: 68 }),
          paddingBottom: Platform.select({ ios: 28, default: 12 }),
          paddingTop: 8,
        },
        tabBarActiveTintColor: Brand.emerald,
        tabBarInactiveTintColor: Brand.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}>
      {/* 1. Today */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Schedule */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'calendar-month' : 'calendar-clock-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Calculator */}
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculator',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'calculator' : 'calculator-variant-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* 4. History */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" size={size} color={color} />
          ),
        }}
      />

      {/* 5. Progress */}
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'chart-line' : 'chart-line-variant'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
