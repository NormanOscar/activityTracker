import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';

import '../../global.css';
import { AuthProvider } from "@/utils/authContext";
import { SettingsProvider } from "@/utils/settingsContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen
            name="(protected)"
            options={{
              headerShown: false,
              animation: "none"
            }}
          />
          <Stack.Screen
            name="(auth)"
            options={{
              headerShown: false,
              animation: "none"
            }}
          />
        </Stack>
      </SettingsProvider>
    </AuthProvider>
  )
}