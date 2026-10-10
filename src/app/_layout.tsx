import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from "react-native-gesture-handler";

import '../../global.css';
import { AuthProvider } from "@/context/authContext";
import { SettingsProvider } from "@/context/settingsContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  )
}