import { useSettings } from "@/utils/settingsContext";

export function useIsDark(): boolean {
  const { theme } = useSettings();
  return theme === "dark";
}
