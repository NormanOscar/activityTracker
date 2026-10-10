import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

import { AuthContext } from "@/context/authContext";
import { getActiveActivities, getActivities } from "@/services/activityService";
import { getCategories } from "@/services/categoryService";
import type { Activity } from "@/models/Activity";
import type { Category } from "@/models/Category";

type ActivitiesState = {
  activities: Activity[];
  setActivities: Dispatch<SetStateAction<Activity[]>>;
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
  loading: boolean;
  hasFullActivities: boolean;
  refreshActivities: () => Promise<void>;
  loadFullActivities: () => Promise<void>;
  refreshCategories: () => Promise<void>;
};

export const ActivitiesContext = createContext<ActivitiesState>({
  activities: [],
  setActivities: () => {},
  categories: [],
  setCategories: () => {},
  loading: true,
  hasFullActivities: false,
  refreshActivities: async () => {},
  loadFullActivities: async () => {},
  refreshCategories: async () => {},
});

export function ActivitiesProvider({ children }: PropsWithChildren) {
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFullActivities, setHasFullActivities] = useState(false);

  const refreshActivities = useCallback(async () => {
    if (!user) return;
    try {
      const data = hasFullActivities
        ? await getActivities(user.uid)
        : await getActiveActivities(user.uid);
      setActivities(data);
    } catch (err) {
      console.error("Failed to refresh activities:", err);
    }
  }, [user, hasFullActivities]);

  const loadFullActivities = useCallback(async () => {
    if (!user || hasFullActivities) return;
    try {
      const data = await getActivities(user.uid);
      setActivities(data);
      setHasFullActivities(true);
    } catch (err) {
      console.error("Failed to load full activity history:", err);
    }
  }, [user, hasFullActivities]);

  const refreshCategories = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getCategories(user.uid);
      setCategories(data);
    } catch (err) {
      console.error("Failed to refresh categories:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setActivities([]);
      setCategories([]);
      setHasFullActivities(false);
      setLoading(true);
      return;
    }

    setLoading(true);
    Promise.all([getActiveActivities(user.uid), getCategories(user.uid)])
      .then(([activitiesData, categoriesData]) => {
        setActivities(activitiesData);
        setCategories(categoriesData);
      })
      .catch((err) =>
        console.error("Failed to load activities/categories:", err),
      )
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <ActivitiesContext.Provider
      value={{
        activities,
        setActivities,
        categories,
        setCategories,
        loading,
        hasFullActivities,
        refreshActivities,
        loadFullActivities,
        refreshCategories,
      }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}
