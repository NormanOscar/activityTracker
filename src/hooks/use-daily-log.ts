import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";

import { getDailyLog, toggleActivityLog } from "@/services/logService";
import { getDateKey } from "@/utils/dateKey";
import type { Activity } from "@/models/Activity";
import type { DailyLog } from "@/models/DailyLog";

export function useDailyLog(userId: string | undefined, selectedDate: Date) {
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const requestIdRef = useRef(0);
  const seqRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!userId) return;
    const dateKey = getDateKey(selectedDate);
    const requestId = ++requestIdRef.current;

    setDailyLog(null);

    getDailyLog(userId, dateKey)
      .then((log) => {
        if (requestId !== requestIdRef.current) return;
        setDailyLog(log);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        console.error("Failed to load daily log:", err);
        setDailyLog({ date: dateKey, activityIds: [] });
      });
  }, [userId, selectedDate]);

  const toggleLog = async (activity: Activity) => {
    if (!userId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const dateKey = getDateKey(selectedDate);
    const currentlyLogged =
      dailyLog?.activityIds.includes(activity.id) ?? false;
    const nextLogged = !currentlyLogged;

    const seq = (seqRef.current[activity.id] ?? 0) + 1;
    seqRef.current[activity.id] = seq;

    setDailyLog((prev) => {
      const base = prev ?? { date: dateKey, activityIds: [] };
      const activityIds = nextLogged
        ? [...base.activityIds, activity.id]
        : base.activityIds.filter((id) => id !== activity.id);
      return { ...base, activityIds };
    });

    try {
      await toggleActivityLog(userId, dateKey, activity.id, nextLogged);
    } catch (err) {
      if (seqRef.current[activity.id] !== seq) return;
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

  const loggedIds = useMemo(
    () => new Set(dailyLog?.activityIds ?? []),
    [dailyLog],
  );

  return { dailyLog, loggedIds, toggleLog };
}
