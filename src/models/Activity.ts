import { Color } from "./Colors";

export type Activity = {
  id: string;
  name: string;
  color: Color;
  icon: string;
  categoryId: string | null;
  isFavorite: boolean;
  createdAt: Date | null;
  archivedAt: Date | null;
  deletedAt: Date | null;
  sortOrder: number;
}
