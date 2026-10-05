import { useContext } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";

import { AuthContext } from "@/utils/authContext";
import { useSettings } from "@/utils/settingsContext";
import { useIsDark } from "@/hooks/use-is-dark";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/colors";

export default function HomeScreen() {
  const { logOut } = useContext(AuthContext);
  const { toggleTheme } = useSettings();
  const isDark = useIsDark();
  const theme = useTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={["top"]}>
      <View className="flex-row justify-end p-4">
        <TouchableOpacity
          onPress={toggleTheme}
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.surface }}
        >
          <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-2xl font-bold" style={{ color: theme.text }}>
          Welcome
        </Text>
      </View>

      <View className="p-6">
        <TouchableOpacity onPress={logOut} className="items-center py-3">
          <Text className="font-semibold" style={{ color: Palette.danger }}>
            Log out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
