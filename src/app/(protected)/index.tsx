import { useCallback, useContext, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Add01Icon, Moon02Icon, Sun03Icon, Pen01Icon, Settings02Icon } from "@hugeicons/core-free-icons";

import { AuthContext } from "@/utils/authContext";
import { useSettings } from "@/utils/settingsContext";
import { useIsDark } from "@/hooks/use-is-dark";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "@/constants/colors";
import { ActivityButton } from "@/components/ActivityButton";
import { NewActivityModal } from "@/components/modals/NewActivityModal";
import { getActivities } from "@/services/activityService";
import type { Activity } from "@/models/Activity";

export default function HomeScreen() {
  const { user, logOut } = useContext(AuthContext);
  const { toggleTheme } = useSettings();
  const isDark = useIsDark();
  const theme = useTheme();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewActivity, setShowNewActivity] = useState(false);

  const loadActivities = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getActivities(user.uid);
      setActivities(data);
    } catch (err) {
      console.error("Failed to load activities:", err);
    }
  }, [user]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const toggleEdit = () => {
    // Implement edit functionality here
  };

  const navigateToSettings = () => {
    // Implement navigation to settings here
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="flex-row justify-between p-4">
          <TouchableOpacity
            onPress={toggleTheme}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.surface }}
          >
            <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} size={26} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={navigateToSettings}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.surface }}
          >
            <HugeiconsIcon icon={Settings02Icon} size={26} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
          }
        >
          <Text className="mb-4 text-2xl font-bold" style={{ color: theme.text }}>
            Welcome
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            {activities.map((activity) => (
              <ActivityButton key={activity.id} {...activity} onPress={() => {}} />
            ))}
          </View>
        </ScrollView>

        <View className="p-6">
          <TouchableOpacity onPress={logOut} className="items-center py-3">
            <Text className="font-semibold" style={{ color: Palette.danger }}>
              Log out
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <TouchableOpacity
        onPress={toggleEdit}
        className="absolute bottom-8 left-6 h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{ backgroundColor: theme.primary, zIndex: 50, elevation: 10 }}
      >
        <HugeiconsIcon icon={Pen01Icon} size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowNewActivity(true)}
        className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{ backgroundColor: theme.primary, zIndex: 50, elevation: 10 }}
      >
        <HugeiconsIcon icon={Add01Icon} size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <NewActivityModal
        visible={showNewActivity}
        onClose={() => setShowNewActivity(false)}
        onCreated={loadActivities}
      />
    </View>
  );
}
