import { useCallback, useContext, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Add01Icon, Pen01Icon, Settings02Icon } from "@hugeicons/core-free-icons";

import { AuthContext } from "@/utils/authContext";
import { useTheme } from "@/hooks/use-theme";
import { ActivityButton } from "@/components/ActivityButton";
import { DateHeader } from "@/components/DateHeader";
import { NewActivityModal } from "@/components/modals/NewActivityModal";
import { getActivities } from "@/services/activityService";
import type { Activity } from "@/models/Activity";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const theme = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date());
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

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <DateHeader
          date={selectedDate}
          onChangeDate={setSelectedDate}
          rightAccessory={
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.surface }}
            >
              <HugeiconsIcon icon={Settings02Icon} size={28} color={theme.text} />
            </TouchableOpacity>
          }
        />

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
      </SafeAreaView>

      <TouchableOpacity
        onPress={toggleEdit}
        className="absolute bottom-8 left-6 h-20 w-20 items-center justify-center rounded-full shadow-lg"
        style={{ backgroundColor: theme.editButton, zIndex: 50, elevation: 10 }}
      >
        <HugeiconsIcon icon={Pen01Icon} size={30} color={theme.text} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowNewActivity(true)}
        className="absolute bottom-8 right-6 h-20 w-20 items-center justify-center rounded-full shadow-lg"
        style={{ backgroundColor: theme.primary, zIndex: 50, elevation: 10 }}
      >
        <HugeiconsIcon icon={Add01Icon} size={30} color={theme.text} />
      </TouchableOpacity>

      <NewActivityModal
        visible={showNewActivity}
        onClose={() => setShowNewActivity(false)}
        onCreated={loadActivities}
      />
    </View>
  );
}
