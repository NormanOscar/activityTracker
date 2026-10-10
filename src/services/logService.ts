import { arrayRemove, arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";

import { FIREBASE_DB } from "@/config/FirebaseConfig";
import type { DailyLog } from "@/models/DailyLog";

function logDoc(userId: string, dateKey: string) {
  return doc(FIREBASE_DB, "users", userId, "logs", dateKey);
}

export async function getDailyLog(userId: string, dateKey: string): Promise<DailyLog> {
  const snapshot = await getDoc(logDoc(userId, dateKey));
  if (!snapshot.exists()) {
    return { date: dateKey, activityIds: [] };
  }

  const data = snapshot.data();
  return { date: dateKey, activityIds: data.activityIds ?? [] };
}

export async function toggleActivityLog(
  userId: string,
  dateKey: string,
  activityId: string,
  logged: boolean
): Promise<void> {
  await setDoc(
    logDoc(userId, dateKey),
    {
      date: dateKey,
      activityIds: logged ? arrayUnion(activityId) : arrayRemove(activityId),
    },
    { merge: true }
  );
}
