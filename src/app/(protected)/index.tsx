import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { ScrollView as GestureHandlerScrollView } from "react-native-gesture-handler";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Add01Icon, BlockGameIcon, Settings02Icon } from "@hugeicons/core-free-icons";
import Sortable from "react-native-sortables";

import { AuthContext } from "@/utils/authContext";
import { useTheme } from "@/hooks/use-theme";
import { useTodayDate } from "@/hooks/use-today-date";
import { ActivityButton } from "@/components/ActivityButton";
import { DateHeader } from "@/components/DateHeader";
import { CreateActivityModal } from "@/components/modals/CreateActivityModal";
import { EditActivityModal } from "@/components/modals/EditActivityModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { archiveActivity, deleteActivity, getActivities, updateActivityOrder } from "@/services/activityService";
import { getDailyLog, toggleActivityLog } from "@/services/logService";
import { getDateKey, startOfDay } from "@/utils/dateKey";
import type { Activity } from "@/models/Activity";
import type { DailyLog } from "@/models/DailyLog";

import { Palette } from "@/constants/colors";

const AnimatedScrollView = Animated.createAnimatedComponent(GestureHandlerScrollView);

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const scrollableRef = useAnimatedRef<typeof AnimatedScrollView>();

  const todayDate = useTodayDate();
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewActivity, setShowNewActivity] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const originalOrderRef = useRef<Activity[]>([]);

  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [pendingAction, setPendingAction] = useState<{ type: "archive" | "delete"; activity: Activity } | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [logLoading, setLogLoading] = useState(false);
  const logRequestIdRef = useRef(0);
  const logSeqRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setSelectedDate(todayDate);
  }, [todayDate]);

  const visibleActivities = useMemo(() => {
    const dateKey = getDateKey(selectedDate);
    return activities.filter((activity) => {
      const afterCreation = !activity.createdAt || dateKey >= getDateKey(activity.createdAt);
      const beforeArchived = !activity.archivedAt || dateKey < getDateKey(activity.archivedAt);
      const beforeDeleted = !activity.deletedAt || dateKey < getDateKey(activity.deletedAt);
      return afterCreation && beforeArchived && beforeDeleted;
    });
  }, [activities, selectedDate]);

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

  useEffect(() => {
    if (!user) return;
    const dateKey = getDateKey(selectedDate);
    const requestId = ++logRequestIdRef.current;

    setDailyLog(null);
    setLogLoading(true);

    getDailyLog(user.uid, dateKey)
      .then((log) => {
        if (requestId !== logRequestIdRef.current) return;
        setDailyLog(log);
      })
      .catch((err) => {
        if (requestId !== logRequestIdRef.current) return;
        console.error("Failed to load daily log:", err);
        setDailyLog({ date: dateKey, activityIds: [] });
      })
      .finally(() => {
        if (requestId === logRequestIdRef.current) setLogLoading(false);
      });
  }, [user, selectedDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const handleToggleLog = async (activity: Activity) => {
    if (!user || editMode) return;

    const dateKey = getDateKey(selectedDate);
    const currentlyLogged = dailyLog?.activityIds.includes(activity.id) ?? false;
    const nextLogged = !currentlyLogged;

    const seq = (logSeqRef.current[activity.id] ?? 0) + 1;
    logSeqRef.current[activity.id] = seq;

    setDailyLog((prev) => {
      const base = prev ?? { date: dateKey, activityIds: [] };
      const activityIds = nextLogged
        ? [...base.activityIds, activity.id]
        : base.activityIds.filter((id) => id !== activity.id);
      return { ...base, activityIds };
    });

    try {
      await toggleActivityLog(user.uid, dateKey, activity.id, nextLogged);
    } catch (err) {
      if (logSeqRef.current[activity.id] !== seq) return;
      console.error("Failed to update log:", err);
      setDailyLog((prev) => {
        if (!prev) return prev;
        const activityIds = nextLogged
          ? prev.activityIds.filter((id) => id !== activity.id)
          : [...prev.activityIds, activity.id];
        return { ...prev, activityIds };
      });
      Alert.alert("Couldn't update log", "Please try again.");
    }
  };

  const enterEditMode = () => {
    originalOrderRef.current = activities;
    setEditMode(true);
  };

  const cancelEditMode = () => {
    setActivities(originalOrderRef.current);
    setEditMode(false);
  };

  const saveEditMode = async () => {
    if (!user) return;
    setSavingOrder(true);
    try {
      const orderedIds = visibleActivities.map((activity) => activity.id);
      await updateActivityOrder(user.uid, orderedIds);
      setActivities((prev) => {
        const orderIndex = new Map(orderedIds.map((id, index) => [id, index]));
        return prev.map((activity) =>
          orderIndex.has(activity.id) ? { ...activity, sortOrder: orderIndex.get(activity.id)! } : activity
        );
      });
      setEditMode(false);
    } catch (err) {
      console.error("Failed to save activity order:", err);
      Alert.alert("Couldn't save order", "Please try again.");
    } finally {
      setSavingOrder(false);
    }
  };

  const handleActivityLongPress = (activity: Activity) => {
    setEditingActivity(activity);
  };

  const handleRequestArchive = (activity: Activity) => {
    setEditingActivity(null);
    setPendingAction({ type: "archive", activity });
  };

  const handleRequestDelete = (activity: Activity) => {
    setEditingActivity(null);
    setPendingAction({ type: "delete", activity });
  };

  const confirmPendingAction = async () => {
    if (!user || !pendingAction) return;
    const { type, activity } = pendingAction;
    const cutoff = startOfDay(selectedDate);

    setActionLoading(true);
    try {
      if (type === "archive") {
        await archiveActivity(user.uid, activity.id, cutoff);
      } else {
        await deleteActivity(user.uid, activity.id, cutoff);
      }
      setActivities((prev) =>
        prev.map((a) =>
          a.id === activity.id
            ? type === "archive"
              ? { ...a, archivedAt: cutoff }
              : { ...a, deletedAt: cutoff }
            : a
        )
      );
      setPendingAction(null);
    } catch (err) {
      console.error(`Failed to ${type} activity:`, err);
      Alert.alert(`Couldn't ${type} activity`, "Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivitySaved = (updated: Activity) => {
    setActivities((prev) => prev.map((activity) => (activity.id === updated.id ? updated : activity)));
    setEditingActivity(null);
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

        <AnimatedScrollView
          ref={scrollableRef}
          className="flex-1 px-4"
          refreshControl={
            editMode ? undefined : (
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.loadingSpinner} />
            )
          }
        >
          <View className="mb-4 flex-row items-center gap-2">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Welcome
            </Text>
            {logLoading && <ActivityIndicator size="small" color={theme.secondaryText} />}
          </View>

          {visibleActivities.length === 0 && (
            <Text style={{ color: theme.secondaryText }}>No activities yet.</Text>
          )}

          <Sortable.Grid
            data={visibleActivities}
            columns={3}
            rowGap={12}
            columnGap={12}
            strategy="insert"
            sortEnabled={editMode}
            scrollableRef={scrollableRef}
            activeItemScale={1.05}
            activeItemShadowOpacity={0.25}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => {
              setActivities((prev) => {
                const visibleIds = new Set(data.map((activity) => activity.id));
                const hidden = prev.filter((activity) => !visibleIds.has(activity.id));
                return [...hidden, ...data];
              });
            }}
            renderItem={({ item }) => (
              <ActivityButton
                {...item}
                editMode={editMode}
                logged={dailyLog?.activityIds.includes(item.id) ?? false}
                onPress={editMode ? undefined : () => handleToggleLog(item)}
                onLongPress={editMode ? undefined : () => handleActivityLongPress(item)}
              />
            )}
          />
        </AnimatedScrollView>
      </SafeAreaView>

      {editMode ? (
        <View className="absolute bottom-8 left-6 right-6 flex-row justify-between" style={{ zIndex: 50 }}>
          <TouchableOpacity
            onPress={cancelEditMode}
            disabled={savingOrder}
            className="rounded-full px-6 py-4 shadow-lg"
            style={{ backgroundColor: theme.surface }}
          >
            <Text className="font-semibold" style={{ color: theme.text }}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={saveEditMode}
            disabled={savingOrder}
            className="rounded-full px-6 py-4 shadow-lg"
            style={{ backgroundColor: savingOrder ? theme.disabled : theme.primary }}
          >
            <Text className="font-semibold" style={{ color: savingOrder ? theme.disabledText : "#FFFFFF" }}>
              {savingOrder ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity
            onPress={enterEditMode}
            className="absolute bottom-8 left-6 h-20 w-20 items-center justify-center rounded-full shadow-lg"
            style={{ backgroundColor: theme.editButton, zIndex: 50, elevation: 10 }}
          >
            <HugeiconsIcon icon={BlockGameIcon} size={30} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowNewActivity(true)}
            className="absolute bottom-8 right-6 h-20 w-20 items-center justify-center rounded-full shadow-lg"
            style={{ backgroundColor: theme.primary, zIndex: 50, elevation: 10 }}
          >
            <HugeiconsIcon icon={Add01Icon} size={30} color={theme.text} />
          </TouchableOpacity>
        </>
      )}

      <CreateActivityModal
        visible={showNewActivity}
        createdAt={startOfDay(selectedDate)}
        onClose={() => setShowNewActivity(false)}
        onCreated={loadActivities}
      />

      <EditActivityModal
        activity={editingActivity}
        onClose={() => setEditingActivity(null)}
        onSaved={handleActivitySaved}
        onRequestArchive={handleRequestArchive}
        onRequestDelete={handleRequestDelete}
      />

      <ConfirmationModal
        visible={!!pendingAction}
        title={pendingAction?.type === "archive" ? "Archive activity?" : "Delete activity?"}
        message={
          pendingAction
            ? `"${pendingAction.activity.name}" will stop showing from today onward. Earlier days keep their history.`
            : undefined
        }
        confirmLabel={actionLoading ? "Working..." : pendingAction?.type === "archive" ? "Archive" : "Delete"}
        destructive={pendingAction?.type === "delete"}
        onConfirm={confirmPendingAction}
        onCancel={() => setPendingAction(null)}
      />
    </View>
  );
}
