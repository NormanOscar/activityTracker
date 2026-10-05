import { Color } from "./Colors";

export type Activity = {
  id: string;
  name: string;
  color: Color;
  icon: string;
  categoryIds: string[];
  archived: boolean;
  sortOrder: number;
  createdAt: Date;
}