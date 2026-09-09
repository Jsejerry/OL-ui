// One Latur design tokens (light theme). Values come from design_guidelines.json.
import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  // Surfaces
  surface: "#FFFFFF",
  onSurface: "#1A1A1A",
  surfaceSecondary: "#F5F6F8",
  onSurfaceSecondary: "#1A1A1A",
  surfaceTertiary: "#EAECEF",
  onSurfaceTertiary: "#4A4D52",
  surfaceInverse: "#1A1A1A",
  onSurfaceInverse: "#FFFFFF",
  muted: "#6B7280",

  // Brand
  brand: "#1A1A1A",
  onBrand: "#FFFFFF",
  brandPrimary: "#1A1A1A",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#A3FF12",
  onBrandSecondary: "#1A1A1A",
  brandTertiary: "#F1FFD9",
  onBrandTertiary: "#1A1A1A",

  // Status
  success: "#E6F4EA",
  onSuccess: "#0C831F",
  warning: "#FFF7D6",
  onWarning: "#997300",
  error: "#FFE6E6",
  onError: "#CC0000",
  info: "#F5F6F8",
  onInfo: "#1A1A1A",

  // Lines
  border: "#EAECEF",
  borderStrong: "#D1D5DB",
  divider: "#F5F6F8",

  // Pastel accents (traffic colors, pastel shades)
  pastelRed: "#FFE6E6",
  pastelYellow: "#FFF7D6",
  pastelGreen: "#E6F4EA",
  pastelBlue: "#E6F0FF",
  pastelPurple: "#F0E6FF",
  pastelPink: "#FFE6F0",
  pastelOrange: "#FFEDD6",
  pastelMint: "#DDF5EA",
  lime: "#A3FF12",
  limeSoft: "#F0FFD7",
  forest: "#174D37",
  forestDeep: "#103B2B",
  food: "#C64B28",
  foodSoft: "#FFF1E8",
  pharmacy: "#087C85",
  pharmacySoft: "#E9F8F7",
  beauty: "#9F3E68",
  beautySoft: "#FCEEF3",
  book: "#7051CB",
  bookSoft: "#F0EAFF",
  bookDark: "#211836",
  cream: "#F8F9F5",
  transparent: "transparent",
  overlay: "rgba(0,0,0,0.45)",
  overlayDeep: "rgba(0,0,0,0.85)",
  whiteGlass: "rgba(255,255,255,0.18)",
  gold: "#FFC72C",
};

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? 'unspecified');
}

setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = (system === 'light' || system === 'dark') && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

export const colors = light;

// Spacing tokens
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
};

// Radius tokens
export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};
