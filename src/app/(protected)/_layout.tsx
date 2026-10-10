import { Redirect, Stack } from "expo-router";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";

import { AuthContext } from "@/context/authContext";
import { ActivitiesProvider } from "@/context/activitiesContext";
import { useTheme } from "@/hooks/use-theme";

export default function ProtectedLayout() {
  const { isReady, isLoggedIn } = useContext(AuthContext);
  const theme = useTheme();

  if (!isReady) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ActivitiesProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ActivitiesProvider>
  );
}
