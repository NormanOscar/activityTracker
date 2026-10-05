import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { FIREBASE_DB } from "@/config/FirebaseConfig";
import type { Activity } from "@/models/Activity";

type NewActivity = Pick<Activity, "name" | "color" | "icon" | "categoryIds">;
type EditableActivity = Pick<Activity, "name" | "color" | "icon">;

function activitiesCollection(userId: string) {
  return collection(FIREBASE_DB, "users", userId, "activities");
}

export async function createActivity(userId: string, activity: NewActivity): Promise<string> {
  // sortOrder places new activities at the end of the current list — one past
  // the highest existing value, not a timestamp (timestamps aren't a sequence
  // and would collide with reordering done via updateActivityOrder).
  const existing = await getDocs(activitiesCollection(userId));
  const nextSortOrder =
    existing.docs.reduce((max, d) => Math.max(max, d.data().sortOrder ?? -1), -1) + 1;

  const ref = await addDoc(activitiesCollection(userId), {
    ...activity,
    archived: false,
    sortOrder: nextSortOrder,
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

// Filters and sorts client-side rather than via Firestore query() — combining an
// equality filter with orderBy on a different field needs a composite index, and
// per-user activity counts are small enough that this is simpler than managing one.
export async function getActivities(userId: string): Promise<Activity[]> {
  const snapshot = await getDocs(activitiesCollection(userId));

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

export async function updateActivity(
  userId: string,
  activityId: string,
  data: EditableActivity
): Promise<void> {
  await updateDoc(doc(FIREBASE_DB, "users", userId, "activities", activityId), data);
}

// Hard-deletes for now. Kept as its own function (rather than inlined Firestore
// calls in the UI) specifically so archiving can replace the body later — e.g.
// swapping this to `updateDoc(ref, { archived: true })` — without touching callers.
export async function deleteActivity(userId: string, activityId: string): Promise<void> {
  await deleteDoc(doc(FIREBASE_DB, "users", userId, "activities", activityId));
}

// Reassigns sequential sortOrder (0, 1, 2, ...) to match orderedIds, in one atomic
// batch — called only on explicit Save, never during dragging itself.
export async function updateActivityOrder(userId: string, orderedIds: string[]): Promise<void> {
  const batch = writeBatch(FIREBASE_DB);

  orderedIds.forEach((activityId, index) => {
    batch.update(doc(FIREBASE_DB, "users", userId, "activities", activityId), { sortOrder: index });
  });

  await batch.commit();
}
