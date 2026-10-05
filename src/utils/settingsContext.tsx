import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Theme = "light" | "dark";

const STORAGE_KEY = "@theme";

type SettingsContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  loading: boolean;
};

const SettingsContext = createContext<SettingsContextType>({
  theme: "light",
  setTheme: () => {},
  loading: true,
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark") {
          setThemeState(stored);
        } else {
          setThemeState(Appearance.getColorScheme() === "dark" ? "dark" : "light");
        }
      } catch (err) {
        console.error("Failed to load theme:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch((err) =>
      console.error("Failed to save theme:", err)
    );
  };

  return (
    <SettingsContext.Provider value={{ theme, setTheme, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
