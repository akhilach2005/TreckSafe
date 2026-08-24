/**
 * Root Layout — TrailSafe
 * Sets up the SafetyResultProvider (context) and expo-router Stack navigator.
 * This wraps all screens, making the shared result state available everywhere.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafetyResultProvider } from '../context/SafetyResultContext';
import { COLORS } from '../constants/theme';

export default function RootLayout() {
  return (
    <SafetyResultProvider>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <Stack
        screenOptions={{
          headerShown:       false,
          contentStyle:      { backgroundColor: COLORS.background },
          animation:         'slide_from_right',
          gestureEnabled:    true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="result" />
      </Stack>
    </SafetyResultProvider>
  );
}
