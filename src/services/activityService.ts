import { addDoc, collection, getDocs, serverTimestamp, Timestamp } from "firebase/firestore";

import { FIREBASE_DB } from "@/config/FirebaseConfig";
import type { Activity } from "@/models/Activity";

type NewActivity = Pick<Activity, "name" | "color" | "icon" | "categoryIds">;

export async function createActivity(userId: string, activity: NewActivity): Promise<string> {
  const ref = await addDoc(collection(FIREBASE_DB, "users", userId, "activities"), {
    ...activity,
    archived: false,
    sortOrder: Date.now(),
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

// Filters and sorts client-side rather than via Firestore query() — combining an
// equality filter with orderBy on a different field needs a composite index, and
// per-user activity counts are small enough that this is simpler than managing one.
export async function getActivities(userId: string): Promise<Activity[]> {
  const snapshot = await getDocs(collection(FIREBASE_DB, "users", userId, "activities"));

  const activities = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      color: data.color,
      icon: data.icon,
      categoryIds: data.categoryIds ?? [],
      archived: data.archived ?? false,
      sortOrder: data.sortOrder ?? 0,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    } satisfies Activity;
  });

  return activities.filter((activity) => !activity.archived).sort((a, b) => a.sortOrder - b.sortOrder);
}
