import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { ScrollView as GestureHandlerScrollView } from "react-native-gesture-handler";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Add01Icon, BlockGameIcon, Settings02Icon } from "@hugeicons/core-free-icons";
import Sortable from "react-native-sortables";

import { AuthContext } from "@/utils/authContext";
import { useTheme } from "@/hooks/use-theme";
import { ActivityButton } from "@/components/ActivityButton";
import { DateHeader } from "@/components/DateHeader";
import { CreateActivityModal } from "@/components/modals/CreateActivityModal";
import { EditActivityModal } from "@/components/modals/EditActivityModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { deleteActivity, getActivities, updateActivityOrder } from "@/services/activityService";
import type { Activity } from "@/models/Activity";

import { Palette } from "@/constants/colors";

// Gesture-handler's own ScrollView, not core React Native's — on iOS, RNGH needs
// the scroll container itself to be one of its own recognized components, or a
// touch that starts with no gesture-handler view underneath it (empty space, as
// opposed to over an ActivityButton) doesn't get handed off to the scroll
// responder correctly. Wrapped in Reanimated's createAnimatedComponent so it still
// works as the scrollableRef target Sortable.Grid needs for autoscroll.
const AnimatedScrollView = Animated.createAnimatedComponent(GestureHandlerScrollView);

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const scrollableRef = useAnimatedRef<typeof AnimatedScrollView>();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewActivity, setShowNewActivity] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const originalOrderRef = useRef<Activity[]>([]);

  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      await updateActivityOrder(
        user.uid,
        activities.map((activity) => activity.id)
      );
      setActivities((prev) => prev.map((activity, index) => ({ ...activity, sortOrder: index })));
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

  const handleRequestDelete = (activity: Activity) => {
    setEditingActivity(null);
    setDeleteTarget(activity);
  };

  const confirmDelete = async () => {
    if (!user || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteActivity(user.uid, deleteTarget.id);
      setActivities((prev) => prev.filter((activity) => activity.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete activity:", err);
      Alert.alert("Couldn't delete activity", "Please try again.");
    } finally {
      setDeleting(false);
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
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.black} />
            )
          }
        >
          <Text className="mb-4 text-2xl font-bold" style={{ color: theme.text }}>
            Welcome
          </Text>

          <Sortable.Grid
            data={activities}
            columns={3}
            rowGap={12}
            columnGap={12}
            strategy="insert"
            sortEnabled={editMode}
            scrollableRef={scrollableRef}
            activeItemScale={1.05}
            activeItemShadowOpacity={0.25}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => setActivities(data)}
            renderItem={({ item }) => (
              <ActivityButton
                {...item}
                editMode={editMode}
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
        onClose={() => setShowNewActivity(false)}
        onCreated={loadActivities}
      />

      <EditActivityModal
        activity={editingActivity}
        onClose={() => setEditingActivity(null)}
        onSaved={handleActivitySaved}
        onRequestDelete={handleRequestDelete}
      />

      <ConfirmationModal
        visible={!!deleteTarget}
        title="Delete activity?"
        message={deleteTarget ? `"${deleteTarget.name}" will be permanently deleted.` : undefined}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
