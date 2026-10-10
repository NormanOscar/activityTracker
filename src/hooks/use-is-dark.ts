import { useSettings } from "@/context/settingsContext";

export function useIsDark(): boolean {
  const { theme } = useSettings();
  return theme === "dark";
}
