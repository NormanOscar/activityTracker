import { useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Alert } from "react-native";

import { updateActivityOrder } from "@/services/activityService";
import { updateCategoryOrder } from "@/services/categoryService";
import type { Activity } from "@/models/Activity";
import type { Category } from "@/models/Category";

type UseEditModeParams = {
  userId: string | undefined;
  activities: Activity[];
  setActivities: Dispatch<SetStateAction<Activity[]>>;
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
  activitiesByCategory: Map<string, Activity[]>;
  uncategorizedActivities: Activity[];
};

export function useEditMode({
  userId,
  activities,
  setActivities,
  categories,
  setCategories,
  activitiesByCategory,
  uncategorizedActivities,
}: UseEditModeParams) {
  const [editMode, setEditMode] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const originalOrderRef = useRef<Activity[]>([]);
  const originalCategoryOrderRef = useRef<Category[]>([]);

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
      return prev.map((activity) =>
        groupIds.has(activity.id) ? data[i++] : activity,
      );
    });
  };

  const saveEditMode = async () => {
    if (!userId) return;
    setSavingOrder(true);
    try {
      const orderedCategoryIds = categories.map((category) => category.id);
      await updateCategoryOrder(userId, orderedCategoryIds);
      setCategories((prev) =>
        prev.map((category, index) => ({ ...category, sortOrder: index })),
      );

      const orderedIds = [
        ...categories.flatMap(
          (category) =>
            activitiesByCategory.get(category.id)?.map((a) => a.id) ?? [],
        ),
        ...uncategorizedActivities.map((a) => a.id),
      ];
      await updateActivityOrder(userId, orderedIds);
      setActivities((prev) => {
        const orderIndex = new Map(orderedIds.map((id, index) => [id, index]));
        return prev.map((activity) =>
          orderIndex.has(activity.id)
            ? { ...activity, sortOrder: orderIndex.get(activity.id)! }
            : activity,
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

  return {
    editMode,
    savingOrder,
    enterEditMode,
    cancelEditMode,
    saveEditMode,
    moveCategory,
    handleActivityDragEnd,
  };
}
