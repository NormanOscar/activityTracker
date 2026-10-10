import { Stack, Redirect } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";

export default function AuthLayout() {
  const { isReady, isLoggedIn } = useContext(AuthContext);

  if (!isReady) return null;
  if (isLoggedIn) return <Redirect href="/(protected)" />;

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forgotPassword" options={{ headerShown: false }} />
    </Stack>
  );
}
