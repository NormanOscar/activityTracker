// Activity colors are arbitrary and user-picked (see models/Colors.ts), so icon/text
// color can't be a fixed value — a dark user-picked card would make dark text invisible,
// the same class of bug as the dark-mode text issue earlier in this app. This picks
// black or white based on the background's relative luminance.
export function getContrastColor(hex: string): "#000000" | "#FFFFFF" {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.substring(0, 2), 16);
  const g = parseInt(normalized.substring(2, 4), 16);
  const b = parseInt(normalized.substring(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? "#000000" : "#FFFFFF";
}
