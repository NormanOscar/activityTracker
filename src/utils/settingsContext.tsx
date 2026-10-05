import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Theme = "light" | "dark";

const STORAGE_KEY = "@theme";

type SettingsContextType = {
  theme: Theme;
  toggleTheme: () => void;
  loading: boolean;
};

const SettingsContext = createContext<SettingsContextType>({
  theme: "light",
  toggleTheme: () => {},
  loading: true,
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark") {
          setTheme(stored);
        } else {
          setTheme(Appearance.getColorScheme() === "dark" ? "dark" : "light");
        }
      } catch (err) {
        console.error("Failed to load theme:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEY, next).catch((err) =>
        console.error("Failed to save theme:", err)
      );
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
