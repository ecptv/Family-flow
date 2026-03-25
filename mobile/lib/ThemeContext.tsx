import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, Theme } from "./theme";

type ThemeContextType = {
  theme: Theme;
  c: typeof colors.dark;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  c: colors.dark,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [loaded, setLoaded] = useState(false);

  console.log("ThemeProvider render, theme:", theme); // ← adaugă asta

  useEffect(() => {
    AsyncStorage.getItem("ff-theme").then((val) => {
      if (val === "light" || val === "dark") setTheme(val);
      setLoaded(true);
    });
  }, []);
  

  const toggleTheme = async () => {
  const next: Theme = theme === "dark" ? "light" : "dark";
  console.log("Switching theme to:", next);
  setTheme(next);
  await AsyncStorage.setItem("ff-theme", next);
};

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, c: colors[theme], toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);