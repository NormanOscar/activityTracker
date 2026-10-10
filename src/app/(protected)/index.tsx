import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { ScrollView as GestureHandlerScrollView } from "react-native-gesture-handler";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Add01Icon, BlockGameIcon, Settings02Icon } from "@hugeicons/core-free-icons";
import Sortable from "react-native-sortables";

import { AuthContext } from "@/utils/authContext";
import { useTheme } from "@/hooks/use-theme";
import { useTodayDate } from "@/hooks/use-today-date";
import { PageHeader } from "@/components/PageHeader";
import { AddMenu } from "@/components/AddMenu";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { CategoryAccordion } from "@/components/CategoryAccordion";
import { ActivityButton } from "@/components/ActivityButton";
import { CreateActivityModal } from "@/components/modals/CreateActivityModal";
import { EditActivityModal } from "@/components/modals/EditActivityModal";
import { NewCategoryModal } from "@/components/modals/NewCategoryModal";
import { EditCategoryModal } from "@/components/modals/EditCategoryModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import {
  archiveActivity,
  clearActivitiesCategory,
  deleteActivity,
  getActivities,
  updateActivityOrder,
} from "@/services/activityService";
import { deleteCategory, getCategories, updateCategoryOrder } from "@/services/categoryService";
import { getDailyLog, toggleActivityLog } from "@/services/logService";
import { getDateKey, startOfDay } from "@/utils/dateKey";
import { Palette } from "@/constants/colors";
import type { Activity } from "@/models/Activity";
import type { Category } from "@/models/Category";
import type { DailyLog } from "@/models/DailyLog";

const AnimatedScrollView = Animated.createAnimatedComponent(GestureHandlerScrollView);

const FAVORITES_SECTION: Category = { id: "favorites", name: "Favorites", sortOrder: -1 };

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const scrollableRef = useAnimatedRef<typeof AnimatedScrollView>();

  const todayDate = useTodayDate();
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const originalOrderRef = useRef<Activity[]>([]);
  const originalCategoryOrderRef = useRef<Category[]>([]);

  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [pendingAction, setPendingAction] = useState<{ type: "archive" | "delete"; activity: Activity } | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [pendingCategoryDelete, setPendingCategoryDelete] = useState<Category | null>(null);
  const [categoryActionLoading, setCategoryActionLoading] = useState(false);

  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
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

  const activitiesByCategory = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const category of categories) {
      map.set(
        category.id,
        visibleActivities.filter((activity) => !activity.isFavorite && activity.categoryId === category.id)
      );
    }
    return map;
  }, [categories, visibleActivities]);

  const favoriteActivities = useMemo(
    () => visibleActivities.filter((activity) => activity.isFavorite),
    [visibleActivities]
  );

  const uncategorizedActivities = useMemo(
    () => visibleActivities.filter((activity) => !activity.isFavorite && !activity.categoryId),
    [visibleActivities]
  );

  const loadActivities = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getActivities(user.uid);
      setActivities(data);
    } catch (err) {
      console.error("Failed to load activities:", err);
    }
  }, [user]);

  const loadCategories = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getCategories(user.uid);
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadActivities(), loadCategories()]).finally(() => setLoading(false));
  }, [loadActivities, loadCategories]);

  useEffect(() => {
    if (!user) return;
    const dateKey = getDateKey(selectedDate);
    const requestId = ++logRequestIdRef.current;

    setDailyLog(null);

    getDailyLog(user.uid, dateKey)
      .then((log) => {
        if (requestId !== logRequestIdRef.current) return;
        setDailyLog(log);
      })
      .catch((err) => {
        if (requestId !== logRequestIdRef.current) return;
        console.error("Failed to load daily log:", err);
        setDailyLog({ date: dateKey, activityIds: [] });
      });
  }, [user, selectedDate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadActivities(), loadCategories()]);
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
    originalCategoryOrderRef.current = categories;
    setEditMode(true);
  };

  const cancelEditMode = () => {
    setActivities(originalOrderRef.current);
    setCategories(originalCategoryOrderRef.current);
    setEditMode(false);
  };

  const moveCategory = (categoryId: string, direction: -1 | 1) => {
    setCategories((prev) => {
      const index = prev.findIndex((category) => category.id === categoryId);
      const swapIndex = index + direction;
      if (index < 0 || swapIndex < 0 || swapIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  };

  const handleActivityDragEnd = (data: Activity[]) => {
    setActivities((prev) => {
      const groupIds = new Set(data.map((activity) => activity.id));
      let i = 0;
      return prev.map((activity) => (groupIds.has(activity.id) ? data[i++] : activity));
    });
  };

  const saveEditMode = async () => {
    if (!user) return;
    setSavingOrder(true);
    try {
      const orderedCategoryIds = categories.map((category) => category.id);
      await updateCategoryOrder(user.uid, orderedCategoryIds);
      setCategories((prev) => prev.map((category, index) => ({ ...category, sortOrder: index })));

      const orderedIds = [
        ...categories.flatMap((category) => activitiesByCategory.get(category.id)?.map((a) => a.id) ?? []),
        ...uncategorizedActivities.map((a) => a.id),
      ];
      await updateActivityOrder(user.uid, orderedIds);
      setActivities((prev) => {
        const orderIndex = new Map(orderedIds.map((id, index) => [id, index]));
        return prev.map((activity) =>
          orderIndex.has(activity.id) ? { ...activity, sortOrder: orderIndex.get(activity.id)! } : activity
        );
      });
      setEditMode(false);
    } catch (err) {
      console.error("Failed to save order:", err);
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

  const handleCategoryLongPress = (category: Category) => {
    setEditingCategory(category);
  };

  const handleCategorySaved = (updated: Category) => {
    setCategories((prev) => prev.map((category) => (category.id === updated.id ? updated : category)));
    setEditingCategory(null);
  };

  const handleRequestCategoryDelete = (category: Category) => {
    setEditingCategory(null);
    setPendingCategoryDelete(category);
  };

  const confirmDeleteCategory = async () => {
    if (!user || !pendingCategoryDelete) return;
    const categoryId = pendingCategoryDelete.id;

    setCategoryActionLoading(true);
    try {
      const affectedIds = activities.filter((a) => a.categoryId === categoryId).map((a) => a.id);
      await deleteCategory(user.uid, categoryId);
      if (affectedIds.length > 0) {
        await clearActivitiesCategory(user.uid, affectedIds);
      }
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setActivities((prev) =>
        prev.map((activity) => (affectedIds.includes(activity.id) ? { ...activity, categoryId: undefined } : activity))
      );
      setPendingCategoryDelete(null);
    } catch (err) {
      console.error("Failed to delete category:", err);
      Alert.alert("Couldn't delete category", "Please try again.");
    } finally {
      setCategoryActionLoading(false);
    }
  };

  const loggedIds = useMemo(() => new Set(dailyLog?.activityIds ?? []), [dailyLog]);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="flex-1">
        <PageHeader
          date={selectedDate}
          onChangeDate={setSelectedDate}
          right={
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
          contentContainerStyle={{ paddingBottom: 105 }}
          refreshControl={
            editMode ? undefined : (
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.loadingSpinner} />
            )
          }
        >
          <View className="mb-4 flex-row items-center gap-2">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Activities
            </Text>
          </View>

          {loading ? (
            <View>
              {[0, 1].map((i) => (
                <View key={i} className="mb-4">
                  <SkeletonLoader width={120} height={24} borderRadius={6} className="mb-3" />
                  <View className="flex-row flex-wrap gap-3">
                    {[0, 1, 2].map((j) => (
                      <SkeletonLoader key={j} width="31%" height={100} borderRadius={16} />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <>
              {visibleActivities.length === 0 && (
                <Text className="mb-4" style={{ color: theme.secondaryText }}>No activities yet.</Text>
              )}

              {favoriteActivities.length > 0 && (
                <CategoryAccordion
                  category={FAVORITES_SECTION}
                  activities={favoriteActivities}
                  editMode={editMode}
                  loggedIds={loggedIds}
                  scrollableRef={scrollableRef}
                  onPressActivity={handleToggleLog}
                  onLongPressActivity={handleActivityLongPress}
                  onDragEnd={(_categoryId, data) => handleActivityDragEnd(data)}
                  sortable={false}
                />
              )}

              {categories.map((category, index) => (
                <CategoryAccordion
                  key={category.id}
                  category={category}
                  activities={activitiesByCategory.get(category.id) ?? []}
                  editMode={editMode}
                  loggedIds={loggedIds}
                  scrollableRef={scrollableRef}
                  onPressActivity={handleToggleLog}
                  onLongPressActivity={handleActivityLongPress}
                  onDragEnd={(_categoryId, data) => handleActivityDragEnd(data)}
                  onMoveUp={() => moveCategory(category.id, -1)}
                  onMoveDown={() => moveCategory(category.id, 1)}
                  canMoveUp={index > 0}
                  canMoveDown={index < categories.length - 1}
                  onLongPressHeader={() => handleCategoryLongPress(category)}
                />
              ))}

              {uncategorizedActivities.length > 0 && (
                <View className="mb-6">
                  <Text className="mb-3 text-base font-bold" style={{ color: theme.text }}>
                    No category
                  </Text>
                  <Sortable.Grid
                    data={uncategorizedActivities}
                    columns={3}
                    rowGap={12}
                    columnGap={12}
                    strategy="insert"
                    sortEnabled={editMode}
                    scrollableRef={scrollableRef}
                    activeItemScale={1.05}
                    activeItemShadowOpacity={0.25}
                    keyExtractor={(item) => item.id}
                    onDragEnd={({ data }) => handleActivityDragEnd(data)}
                    renderItem={({ item }) => (
                      <ActivityButton
                        {...item}
                        editMode={editMode}
                        logged={loggedIds.has(item.id)}
                        onPress={editMode ? undefined : () => handleToggleLog(item)}
                        onLongPress={editMode ? undefined : () => handleActivityLongPress(item)}
                      />
                    )}
                  />
                </View>
              )}
            </>
          )}
        </AnimatedScrollView>
      </View>

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
            onPress={() => setShowAddMenu(true)}
            className="absolute bottom-8 right-6 h-20 w-20 items-center justify-center rounded-full shadow-lg"
            style={{ backgroundColor: theme.primary, zIndex: 50, elevation: 10 }}
          >
            <HugeiconsIcon icon={Add01Icon} size={30} color={theme.text} />
          </TouchableOpacity>
        </>
      )}

      <AddMenu
        visible={showAddMenu}
        onClose={() => setShowAddMenu(false)}
        onSelectActivity={() => setShowNewActivity(true)}
        onSelectCategory={() => setShowNewCategory(true)}
      />

      <CreateActivityModal
        visible={showNewActivity}
        createdAt={startOfDay(selectedDate)}
        categories={categories}
        onClose={() => setShowNewActivity(false)}
        onCreated={loadActivities}
      />

      <NewCategoryModal
        visible={showNewCategory}
        onClose={() => setShowNewCategory(false)}
        onCreated={loadCategories}
      />

      <EditActivityModal
        activity={editingActivity}
        categories={categories}
        onClose={() => setEditingActivity(null)}
        onSaved={handleActivitySaved}
        onRequestArchive={handleRequestArchive}
        onRequestDelete={handleRequestDelete}
      />

      <EditCategoryModal
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSaved={handleCategorySaved}
        onRequestDelete={handleRequestCategoryDelete}
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
        confirmColor={pendingAction?.type === "delete" ? Palette.danger : theme.primary}
        onConfirm={confirmPendingAction}
        onCancel={() => setPendingAction(null)}
      />

      <ConfirmationModal
        visible={!!pendingCategoryDelete}
        title="Delete category?"
        message={
          pendingCategoryDelete
            ? `"${pendingCategoryDelete.name}" will be deleted permanently. Activities in it will be moved to No category.`
            : undefined
        }
        confirmLabel={categoryActionLoading ? "Working..." : "Delete"}
        confirmColor={Palette.danger}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setPendingCategoryDelete(null)}
      />
    </View>
  );
}
