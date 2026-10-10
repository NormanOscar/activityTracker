import { useContext, useEffect, useMemo, useState } from "react";
import { RefreshControl, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { ScrollView as GestureHandlerScrollView } from "react-native-gesture-handler";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Add01Icon,
  BlockGameIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import Sortable from "react-native-sortables";

import { AuthContext } from "@/context/authContext";
import { ActivitiesContext } from "@/context/activitiesContext";
import { useTheme } from "@/hooks/use-theme";
import { useTodayDate } from "@/hooks/use-today-date";
import { useDailyLog } from "@/hooks/use-daily-log";
import { useEditMode } from "@/hooks/use-edit-mode";
import { useActivityActions } from "@/hooks/use-activity-actions";
import { useCategoryActions } from "@/hooks/use-category-actions";
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
import { getDateKey, startOfDay } from "@/utils/dateKey";
import { Palette } from "@/constants/colors";
import type { Category } from "@/models/Category";

const AnimatedScrollView = Animated.createAnimatedComponent(
  GestureHandlerScrollView,
);

const FAVORITES_SECTION: Category = {
  id: "favorites",
  name: "Favorites",
  sortOrder: -1,
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const scrollableRef = useAnimatedRef<typeof AnimatedScrollView>();

  const {
    activities,
    setActivities,
    categories,
    setCategories,
    loading,
    refreshActivities: loadActivities,
    loadFullActivities,
    refreshCategories: loadCategories,
  } = useContext(ActivitiesContext);

  const todayDate = useTodayDate();
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showNewActivity, setShowNewActivity] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    setSelectedDate(todayDate);
  }, [todayDate]);

  const visibleActivities = useMemo(() => {
    const dateKey = getDateKey(selectedDate);
    return activities.filter((activity) => {
      const afterCreation =
        !activity.createdAt || dateKey >= getDateKey(activity.createdAt);
      const beforeArchived =
        !activity.archivedAt || dateKey < getDateKey(activity.archivedAt);
      const beforeDeleted =
        !activity.deletedAt || dateKey < getDateKey(activity.deletedAt);
      return afterCreation && beforeArchived && beforeDeleted;
    });
  }, [activities, selectedDate]);

  const activitiesByCategory = useMemo(() => {
    const map = new Map<string, typeof activities>();
    for (const category of categories) {
      map.set(
        category.id,
        visibleActivities.filter(
          (activity) =>
            !activity.isFavorite && activity.categoryId === category.id,
        ),
      );
    }
    return map;
  }, [categories, visibleActivities]);

  const favoriteActivities = useMemo(
    () => visibleActivities.filter((activity) => activity.isFavorite),
    [visibleActivities],
  );

  const uncategorizedActivities = useMemo(
    () =>
      visibleActivities.filter(
        (activity) => !activity.isFavorite && !activity.categoryId,
      ),
    [visibleActivities],
  );

  useEffect(() => {
    if (getDateKey(selectedDate) === getDateKey(todayDate)) return;
    loadFullActivities();
  }, [selectedDate, todayDate, loadFullActivities]);

  const { loggedIds, toggleLog: handleToggleLog } = useDailyLog(
    user?.uid,
    selectedDate,
  );

  const {
    editMode,
    savingOrder,
    enterEditMode,
    cancelEditMode,
    saveEditMode,
    moveCategory,
    handleActivityDragEnd,
  } = useEditMode({
    userId: user?.uid,
    activities,
    setActivities,
    categories,
    setCategories,
    activitiesByCategory,
    uncategorizedActivities,
  });

  const {
    editingActivity,
    setEditingActivity,
    pendingAction,
    setPendingAction,
    actionLoading,
    handleActivityLongPress,
    handleRequestArchive,
    handleRequestDelete,
    confirmPendingAction,
    handleActivitySaved,
  } = useActivityActions({ userId: user?.uid, selectedDate, setActivities });

  const {
    editingCategory,
    setEditingCategory,
    pendingCategoryDelete,
    setPendingCategoryDelete,
    categoryActionLoading,
    handleCategoryLongPress,
    handleCategorySaved,
    handleRequestCategoryDelete,
    confirmDeleteCategory,
  } = useCategoryActions({ userId: user?.uid, setCategories, setActivities });

  const isViewingToday = getDateKey(selectedDate) === getDateKey(todayDate);
  const loggedTodayCount = visibleActivities.filter((activity) =>
    loggedIds.has(activity.id),
  ).length;

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    try {
      await Promise.all([loadActivities(), loadCategories()]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="flex-1">
        <PageHeader
          date={selectedDate}
          onChangeDate={setSelectedDate}
          disabled={editMode}
          right={
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              disabled={editMode}
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: theme.surface,
                opacity: editMode ? 0.4 : 1,
              }}
            >
              <HugeiconsIcon
                icon={Settings02Icon}
                size={28}
                color={theme.text}
              />
            </TouchableOpacity>
          }
        />

        <AnimatedScrollView
          ref={scrollableRef}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 105 }}
          refreshControl={
            editMode ? undefined : (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={theme.loadingSpinner}
              />
            )
          }
        >
          <View className="mb-4">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Activities
            </Text>
            {!loading && visibleActivities.length > 0 && (
              <Text
                className="mt-1 text-sm"
                style={{ color: theme.secondaryText }}
              >
                {loggedTodayCount} of {visibleActivities.length} logged
                {isViewingToday ? " today" : ""}
              </Text>
            )}
          </View>

          {loading ? (
            <View>
              {[0, 1].map((i) => (
                <View key={i} className="mb-4">
                  <SkeletonLoader
                    width={120}
                    height={24}
                    borderRadius={6}
                    className="mb-3"
                  />
                  <View className="flex-row flex-wrap gap-3">
                    {[0, 1, 2].map((j) => (
                      <SkeletonLoader
                        key={j}
                        width="31%"
                        height={100}
                        borderRadius={16}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <>
              {visibleActivities.length === 0 && (
                <Text className="mb-4" style={{ color: theme.secondaryText }}>
                  No activities yet.
                </Text>
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
                  <Text
                    className="mb-3 text-base font-bold"
                    style={{ color: theme.text }}
                  >
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
                        onPress={
                          editMode ? undefined : () => handleToggleLog(item)
                        }
                        onLongPress={
                          editMode
                            ? undefined
                            : () => handleActivityLongPress(item)
                        }
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
        <View
          className="absolute bottom-8 left-6 right-6 flex-row justify-between"
          style={{ zIndex: 50 }}
        >
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
            style={{
              backgroundColor: savingOrder ? theme.disabled : theme.primary,
            }}
          >
            <Text
              className="font-semibold"
              style={{ color: savingOrder ? theme.disabledText : "#FFFFFF" }}
            >
              {savingOrder ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity
            onPress={enterEditMode}
            disabled={loading}
            className="absolute bottom-8 left-6 h-20 w-20 items-center justify-center rounded-full shadow-lg"
            style={{
              backgroundColor: theme.editButton,
              zIndex: 50,
              elevation: 10,
              opacity: loading ? 0.4 : 1,
            }}
          >
            <HugeiconsIcon icon={BlockGameIcon} size={30} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowAddMenu(true)}
            disabled={loading}
            className="absolute bottom-8 right-6 h-20 w-20 items-center justify-center rounded-full shadow-lg"
            style={{
              backgroundColor: theme.primary,
              zIndex: 50,
              elevation: 10,
              opacity: loading ? 0.4 : 1,
            }}
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
        activities={activities}
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
        activities={activities}
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
        title={
          pendingAction?.type === "archive"
            ? "Archive activity?"
            : "Delete activity?"
        }
        message={
          pendingAction
            ? `"${pendingAction.activity.name}" will stop showing from today onward. Earlier days keep their history.`
            : undefined
        }
        confirmLabel={
          actionLoading
            ? "Working..."
            : pendingAction?.type === "archive"
              ? "Archive"
              : "Delete"
        }
        confirmColor={
          pendingAction?.type === "delete" ? Palette.danger : theme.primary
        }
        loading={actionLoading}
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
        loading={categoryActionLoading}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setPendingCategoryDelete(null)}
      />
    </View>
  );
}
