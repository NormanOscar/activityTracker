import { useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft01Icon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

import { AuthContext } from "@/utils/authContext";
import { useSettings } from "@/utils/settingsContext";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/colors";

export default function SettingsScreen() {
  const router = useRouter();
  const { logOut } = useContext(AuthContext);
  const { theme: activeTheme, setTheme } = useSettings();
  const theme = useTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={["top", "bottom"]}>
      <View className="px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={30} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-4">
        <Text className="mb-4 text-2xl font-bold" style={{ color: theme.text }}>
          Settings
        </Text>

        <View className="gap-4">
          <View className="rounded-lg border p-3" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
            <Text className="mb-3 text-m font-semibold" style={{ color: theme.secondaryText }}>
              Appearance
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setTheme("light")}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                style={{
                  backgroundColor: activeTheme === "light" ? theme.primary : theme.background,
                  borderWidth: 1,
                  borderColor: activeTheme === "light" ? theme.primary : theme.border,
                }}
              >
                <HugeiconsIcon
                  icon={Sun03Icon}
                  size={20}
                  color={theme.text}
                />
                <Text
                  className="font-semibold"
                  style={{ color: theme.text }}
                >
                  Light
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTheme("dark")}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                style={{
                  backgroundColor: activeTheme === "dark" ? theme.primary : theme.background,
                  borderWidth: 1,
                  borderColor: activeTheme === "dark" ? theme.primary : theme.border,
                }}
              >
                <HugeiconsIcon
                  icon={Moon02Icon}
                  size={20}
                  color={theme.text}
                />
                <Text
                  className="font-semibold"
                  style={{ color: theme.text }}
                >
                  Dark
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4">
        <TouchableOpacity
          onPress={logOut}
          className="items-center rounded-lg border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Text className="text-lg font-semibold" style={{ color: Palette.danger }}>
            Log out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
