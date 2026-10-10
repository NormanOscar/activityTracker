import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, writeBatch } from "firebase/firestore";

import { FIREBASE_DB } from "@/config/FirebaseConfig";
import type { Category } from "@/models/Category";

function categoriesCollection(userId: string) {
  return collection(FIREBASE_DB, "users", userId, "categories");
}

export async function getCategories(userId: string): Promise<Category[]> {
  const snapshot = await getDocs(categoriesCollection(userId));
  const categories = snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      sortOrder: data.sortOrder ?? 0,
    } satisfies Category;
  });

  return categories.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createCategory(userId: string, name: string): Promise<string> {
  const existing = await getDocs(categoriesCollection(userId));
  const nextSortOrder = existing.docs.reduce((max, d) => Math.max(max, d.data().sortOrder ?? -1), -1) + 1;

  const ref = await addDoc(categoriesCollection(userId), { name, sortOrder: nextSortOrder });
  return ref.id;
}

export async function updateCategory(userId: string, categoryId: string, name: string): Promise<void> {
  await updateDoc(doc(FIREBASE_DB, "users", userId, "categories", categoryId), { name });
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  await deleteDoc(doc(FIREBASE_DB, "users", userId, "categories", categoryId));
}

export async function updateCategoryOrder(userId: string, orderedIds: string[]): Promise<void> {
  const batch = writeBatch(FIREBASE_DB);

  orderedIds.forEach((categoryId, index) => {
    batch.update(doc(FIREBASE_DB, "users", userId, "categories", categoryId), { sortOrder: index });
  });

  await batch.commit();
}
