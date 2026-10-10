import { addDoc, collection, deleteField, doc, getDocs, Timestamp, updateDoc, writeBatch } from "firebase/firestore";

import { FIREBASE_DB } from "@/config/FirebaseConfig";
import type { Activity } from "@/models/Activity";

type NewActivity = Pick<Activity, "name" | "color" | "icon" | "categoryIds" | "createdAt">;
type EditableActivity = Pick<Activity, "name" | "color" | "icon" | "createdAt">;

function activitiesCollection(userId: string) {
  return collection(FIREBASE_DB, "users", userId, "activities");
}

function toDate(value: unknown): Date | undefined {
  return value instanceof Timestamp ? value.toDate() : undefined;
}

export async function createActivity(userId: string, activity: NewActivity): Promise<string> {
  const existing = await getDocs(activitiesCollection(userId));
  const nextSortOrder =
    existing.docs.reduce((max, d) => Math.max(max, d.data().sortOrder ?? -1), -1) + 1;

  const ref = await addDoc(activitiesCollection(userId), {
    ...activity,
    sortOrder: nextSortOrder,
  });

  return ref.id;
}

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
      createdAt: toDate(data.createdAt),
      archivedAt: toDate(data.archivedAt),
      deletedAt: toDate(data.deletedAt),
      sortOrder: data.sortOrder ?? 0,
    } satisfies Activity;
  });

  return activities.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function updateActivity(
  userId: string,
  activityId: string,
  data: EditableActivity
): Promise<void> {
  await updateDoc(doc(FIREBASE_DB, "users", userId, "activities", activityId), data);
}

export async function archiveActivity(userId: string, activityId: string, archivedAt: Date): Promise<void> {
  await updateDoc(doc(FIREBASE_DB, "users", userId, "activities", activityId), { archivedAt });
}

export async function deleteActivity(userId: string, activityId: string, deletedAt: Date): Promise<void> {
  await updateDoc(doc(FIREBASE_DB, "users", userId, "activities", activityId), { deletedAt });
}

export async function unarchiveActivity(userId: string, activityId: string): Promise<void> {
  await updateDoc(doc(FIREBASE_DB, "users", userId, "activities", activityId), {
    archivedAt: deleteField(),
  });
}

export async function updateActivityOrder(userId: string, orderedIds: string[]): Promise<void> {
  const batch = writeBatch(FIREBASE_DB);

  orderedIds.forEach((activityId, index) => {
    batch.update(doc(FIREBASE_DB, "users", userId, "activities", activityId), { sortOrder: index });
  });

  await batch.commit();
}
