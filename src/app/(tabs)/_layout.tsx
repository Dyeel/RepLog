import { Tabs } from 'expo-router';

import { CustomTabBar } from '@/components/navigation/custom-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      }}>
      {/* 1. Today */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
        }}
      />

      {/* 2. Schedule */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
        }}
      />

      {/* 3. Calculator */}
      <Tabs.Screen
        name="calculator"
        options={{
          title: 'Calculator',
        }}
      />

      {/* 4. History */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
        }}
      />

      {/* 5. Profile & Progression */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />

      {/* Legacy Progress Tab Redirect / Hidden */}
      <Tabs.Screen
        name="progress"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
