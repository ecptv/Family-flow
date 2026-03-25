import AsyncStorage from "@react-native-async-storage/async-storage";

export type Theme = "dark" | "light";

export const THEME_KEY = "ff-theme";

export const colors = {
  dark: {
    bg: "#0a0a14",
    card: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.08)",
    text: "#ffffff",
    textSub: "rgba(255,255,255,0.5)",
    textMuted: "rgba(255,255,255,0.3)",
    accent: "#A78BFA",
    inputBg: "rgba(255,255,255,0.07)",
    inputBorder: "rgba(255,255,255,0.1)",
  },
  light: {
    bg: "#F5F0E8",
    card: "rgba(255,255,255,0.8)",
    border: "rgba(0,0,0,0.08)",
    text: "#1a1a2e",
    textSub: "rgba(26,26,46,0.6)",
    textMuted: "rgba(26,26,46,0.35)",
    accent: "#7C3AED",
    inputBg: "rgba(0,0,0,0.05)",
    inputBorder: "rgba(0,0,0,0.1)",
  },
};

export async function getTheme(): Promise<Theme> {
  const saved = await AsyncStorage.getItem(THEME_KEY);
  return (saved as Theme) || "dark";
}

export async function saveTheme(theme: Theme): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, theme);
}