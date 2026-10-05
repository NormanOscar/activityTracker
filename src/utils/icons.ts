import * as HugeIcons from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react-native";

// Activities store their icon as a string (the export name, e.g. "Sun03Icon") so it's
// plain JSON that can round-trip through Firestore. This looks that name back up against
// every icon Hugeicons ships — the same lookup an icon-search dropdown would filter over.
export function getIconByName(name: string): IconSvgElement | undefined {
  return (HugeIcons as unknown as Record<string, IconSvgElement>)[name];
}
