import { darkTheme, lightTheme } from "@/constants/themes";
import { useIsDark } from "@/hooks/use-is-dark";

// Returns the token object for whichever theme is active, picked from
// settingsContext's theme (via useIsDark) — not the device's OS setting.
export function useTheme() {
  const isDark = useIsDark();
  return isDark ? darkTheme : lightTheme;
}
