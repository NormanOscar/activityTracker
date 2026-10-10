import { Color } from "./Colors";

export type Activity = {
  id: string;
  name: string;
  color: Color;
  icon: string;
  categoryId?: string;
  isFavorite?: boolean;
  createdAt?: Date;
  archivedAt?: Date;
  deletedAt?: Date;
  sortOrder: number;
}
