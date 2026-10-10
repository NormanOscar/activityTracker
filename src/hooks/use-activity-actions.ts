import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Alert } from "react-native";

import { archiveActivity, deleteActivity } from "@/services/activityService";
import { startOfDay } from "@/utils/dateKey";
import type { Activity } from "@/models/Activity";

type PendingActivityAction = { type: "archive" | "delete"; activity: Activity };

type UseActivityActionsParams = {
  userId: string | undefined;
  selectedDate: Date;
  setActivities: Dispatch<SetStateAction<Activity[]>>;
};

export function useActivityActions({ userId, selectedDate, setActivities }: UseActivityActionsParams) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingActivityAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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
    if (!userId || !pendingAction) return;
    const { type, activity } = pendingAction;
    const cutoff = startOfDay(selectedDate);

    setActionLoading(true);
    try {
      if (type === "archive") {
        await archiveActivity(userId, activity.id, cutoff);
      } else {
        await deleteActivity(userId, activity.id, cutoff);
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

  return {
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
  };
}
