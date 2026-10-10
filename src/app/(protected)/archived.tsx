import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft01Icon, SortByDown01Icon, SortByUp01Icon } from "@hugeicons/core-free-icons";

import { AuthContext } from "@/utils/authContext";
import { useTheme } from "@/hooks/use-theme";
import { PageHeader } from "@/components/PageHeader";
import { ArchivedActivityRow } from "@/components/ArchivedActivityRow";
import { getActivities, unarchiveActivity } from "@/services/activityService";
import { getDateKey } from "@/utils/dateKey";
import type { Activity } from "@/models/Activity";

function formatGroupDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArchivedActivitiesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [sortAscending, setSortAscending] = useState(false);

  const loadArchived = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getActivities(user.uid);
      setActivities(data.filter((activity) => activity.archivedAt && !activity.deletedAt));
    } catch (err) {
      console.error("Failed to load archived activities:", err);
    }
  }, [user]);

  useEffect(() => {
    loadArchived();
  }, [loadArchived]);

  const groups = useMemo(() => {
    const byDate = new Map<string, Activity[]>();
    for (const activity of activities) {
      if (!activity.archivedAt) continue;
      const key = getDateKey(activity.archivedAt);
      const existing = byDate.get(key);
      if (existing) {
        existing.push(activity);
      } else {
        byDate.set(key, [activity]);
      }
    }

    return Array.from(byDate.entries()).sort(([a], [b]) => (sortAscending ? a.localeCompare(b) : b.localeCompare(a)));
  }, [activities, sortAscending]);

  const handleUnarchive = async (activity: Activity) => {
    if (!user) return;
    setActivities((prev) => prev.filter((a) => a.id !== activity.id));
    try {
      await unarchiveActivity(user.uid, activity.id);
    } catch (err) {
      console.error("Failed to unarchive activity:", err);
      setActivities((prev) => [...prev, activity]);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={["bottom"]}>
      <PageHeader
        left={
          <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={30} color={theme.text} />
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity
            onPress={() => setSortAscending((prev) => !prev)}
            className="h-10 w-10 items-center justify-center"
          >
            <HugeiconsIcon
              icon={sortAscending ? SortByUp01Icon : SortByDown01Icon}
              size={26}
              color={theme.text}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1 px-4">
        <Text className="mb-4 text-2xl font-bold" style={{ color: theme.text }}>
          Archived Activities
        </Text>

        {groups.length === 0 && (
          <Text style={{ color: theme.secondaryText }}>No archived activities.</Text>
        )}

        <View className="gap-6">
          {groups.map(([dateKey, items]) => (
            <View key={dateKey} className="gap-3">
              <Text className="text-sm font-semibold" style={{ color: theme.secondaryText }}>
                {formatGroupDate(dateKey)}
              </Text>

              <View className="gap-3">
                {items.map((activity) => (
                  <ArchivedActivityRow
                    key={activity.id}
                    activity={activity}
                    onUnarchive={() => handleUnarchive(activity)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
