import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Alert } from "react-native";

import { clearActivitiesCategory, getActivityIdsByCategory } from "@/services/activityService";
import { deleteCategory } from "@/services/categoryService";
import type { Activity } from "@/models/Activity";
import type { Category } from "@/models/Category";

type UseCategoryActionsParams = {
  userId: string | undefined;
  setCategories: Dispatch<SetStateAction<Category[]>>;
  setActivities: Dispatch<SetStateAction<Activity[]>>;
};

export function useCategoryActions({ userId, setCategories, setActivities }: UseCategoryActionsParams) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [pendingCategoryDelete, setPendingCategoryDelete] = useState<Category | null>(null);
  const [categoryActionLoading, setCategoryActionLoading] = useState(false);

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
    if (!userId || !pendingCategoryDelete) return;
    const categoryId = pendingCategoryDelete.id;

    setCategoryActionLoading(true);
    try {
      const affectedIds = await getActivityIdsByCategory(userId, categoryId);
      await deleteCategory(userId, categoryId);
      if (affectedIds.length > 0) {
        await clearActivitiesCategory(userId, affectedIds);
      }
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setActivities((prev) =>
        prev.map((activity) => (affectedIds.includes(activity.id) ? { ...activity, categoryId: null } : activity))
      );
      setPendingCategoryDelete(null);
    } catch (err) {
      console.error("Failed to delete category:", err);
      Alert.alert("Couldn't delete category", "Please try again.");
    } finally {
      setCategoryActionLoading(false);
    }
  };

  return {
    editingCategory,
    setEditingCategory,
    pendingCategoryDelete,
    setPendingCategoryDelete,
    categoryActionLoading,
    handleCategoryLongPress,
    handleCategorySaved,
    handleRequestCategoryDelete,
    confirmDeleteCategory,
  };
}
