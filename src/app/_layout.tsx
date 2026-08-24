import { useEffect } from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';

import { Brand } from '@/constants/theme';
import { WorkoutProvider } from '@/context/workout-store';

SplashScreen.preventAutoHideAsync();

const RepLogTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Brand.background,
    card: Brand.card,
    border: Brand.cardBorder,
    primary: Brand.emerald,
    text: '#FFFFFF',
  },
};

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <WorkoutProvider>
      <ThemeProvider value={RepLogTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 250,
          }}>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="welcome"
            options={{
              headerShown: false,
              animation: 'fade',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="log"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
              animationDuration: 280,
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="workout/[date]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="history/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </ThemeProvider>
    </WorkoutProvider>
  );
}
