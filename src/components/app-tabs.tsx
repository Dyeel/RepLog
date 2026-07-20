import { Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <Label>Today</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history">
        <Label>History</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="schedule">
        <Label>Schedule</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
