import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

import { FIREBASE_DB } from "@/config/FirebaseConfig";
import type { Activity } from "@/models/Activity";

type NewActivity = Pick<Activity, "name" | "color" | "icon" | "categoryId" | "createdAt">;
type EditableActivity = Pick<Activity, "name" | "color" | "icon" | "categoryId" | "isFavorite" | "createdAt">;

function activitiesCollection(userId: string) {
  return collection(FIREBASE_DB, "users", userId, "activities");
}

function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
}

function mapActivityDoc(doc: QueryDocumentSnapshot<DocumentData>): Activity {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    color: data.color,
    icon: data.icon,
    categoryId: data.categoryId ?? null,
    isFavorite: data.isFavorite ?? false,
    createdAt: toDate(data.createdAt),
    archivedAt: toDate(data.archivedAt),
    deletedAt: toDate(data.deletedAt),
    sortOrder: data.sortOrder ?? 0,
  } satisfies Activity;
}

export async function createActivity(userId: string, activity: NewActivity): Promise<string> {
  const ref = await addDoc(activitiesCollection(userId), {
    name: activity.name,
    color: activity.color,
    icon: activity.icon,
    categoryId: activity.categoryId ?? null,
    createdAt: activity.createdAt ?? null,
    isFavorite: false,
    archivedAt: null,
    deletedAt: null,
    sortOrder: Date.now(),
  });

  return ref.id;
}

export async function getActivities(userId: string): Promise<Activity[]> {
  const snapshot = await getDocs(activitiesCollection(userId));
  return snapshot.docs.map(mapActivityDoc).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getActiveActivities(userId: string): Promise<Activity[]> {
  const activeQuery = query(
    activitiesCollection(userId),
    where("archivedAt", "==", null),
    where("deletedAt", "==", null)
  );
  const snapshot = await getDocs(activeQuery);
  return snapshot.docs.map(mapActivityDoc).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function updateActivity(
  userId: string,
  activityId: string,
  data: EditableActivity
): Promise<void> {
  await updateDoc(doc(FIREBASE_DB, "users", userId, "activities", activityId), {
    name: data.name,
    color: data.color,
    icon: data.icon,
    categoryId: data.categoryId ?? null,
    isFavorite: data.isFavorite,
    createdAt: data.createdAt ?? null,
  });
}

export async function archiveActivity(userId: string, activityId: string, archivedAt: Date): Promise<void> {
  await updateDoc(doc(FIREBASE_DB, "users", userId, "activities", activityId), { archivedAt });
}

export async function deleteActivity(userId: string, activityId: string, deletedAt: Date): Promise<void> {
  await updateDoc(doc(FIREBASE_DB, "users", userId, "activities", activityId), { deletedAt });
}

export async function unarchiveActivity(userId: string, activityId: string): Promise<void> {
  await updateDoc(doc(FIREBASE_DB, "users", userId, "activities", activityId), {
    archivedAt: null,
  });
}

export async function getActivityIdsByCategory(userId: string, categoryId: string): Promise<string[]> {
  const categoryQuery = query(activitiesCollection(userId), where("categoryId", "==", categoryId));
  const snapshot = await getDocs(categoryQuery);
  return snapshot.docs.map((d) => d.id);
}

export async function clearActivitiesCategory(userId: string, activityIds: string[]): Promise<void> {
  if (activityIds.length === 0) return;

  const batch = writeBatch(FIREBASE_DB);
  activityIds.forEach((activityId) => {
    batch.update(doc(FIREBASE_DB, "users", userId, "activities", activityId), { categoryId: null });
  });

  await batch.commit();
}

export async function updateActivityOrder(userId: string, orderedIds: string[]): Promise<void> {
  const batch = writeBatch(FIREBASE_DB);

  orderedIds.forEach((activityId, index) => {
    batch.update(doc(FIREBASE_DB, "users", userId, "activities", activityId), { sortOrder: index });
  });

  await batch.commit();
}
