import { Color } from "./Colors";

export type Activity = {
  id: string;
  name: string;
  color: Color;
  icon: string;
  categoryIds: string[];
  createdAt?: Date;
  archivedAt?: Date;
  deletedAt?: Date;
  sortOrder: number;
}
