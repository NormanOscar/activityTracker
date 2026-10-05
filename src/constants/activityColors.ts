import type { Color } from "@/models/Colors";

// Sentinel id for the "no color" option — it has no fixed hex since its actual
// render color is theme-derived (see theme.noColorBackground), not a swatch value.
export const NO_COLOR_ID = "none";

export const ACTIVITY_COLORS: Color[] = [
  { id: NO_COLOR_ID, name: "No color", hex: "" },
  { id: "blue", name: "Blue", hex: "#A8C6E8" },
  { id: "indigo", name: "Indigo", hex: "#A8B6E8" },
  { id: "purple", name: "Purple", hex: "#B6A8E8" },
  { id: "pink", name: "Pink", hex: "#E8A8D6" },
  { id: "red", name: "Red", hex: "#E8A8A8" },
  { id: "orange", name: "Orange", hex: "#E8C6A8" },
  { id: "yellow", name: "Yellow", hex: "#E8E0A8" },
  { id: "green", name: "Green", hex: "#A8E8B6" },
  { id: "teal", name: "Teal", hex: "#A8E8E0" },
  { id: "cyan", name: "Cyan", hex: "#A8D6E8" },
  { id: "brown", name: "Brown", hex: "#C6A88C" },
  { id: "gray", name: "Gray", hex: "#C6C6C6" },
];
