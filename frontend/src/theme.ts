// OneCity: soft, translucent surfaces and flowing department gradients.
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
  brandSecondary: "#76EC00",
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
  lime: "#76EC00",
  electricLime: '#B3F400',
  limeSoft: "#F0FFD7",
  forest: "#174D37",
  forestDeep: "#103B2B",
  food: "#174D37",
  foodSoft: "#F0FFD7",
  pharmacy: "#174D37",
  pharmacySoft: "#E9F8EF",
  beauty: "#174D37",
  beautySoft: "#F1FBEA",
  book: "#174D37",
  bookSoft: "#F0FFD7",
  bookDark: "#103B2B",
  cream: "#F8F9F5",
  transparent: "transparent",
  overlay: "rgba(0,0,0,0.45)",
  overlayDeep: "rgba(0,0,0,0.85)",
  whiteGlass: "rgba(255,255,255,0.18)",
  gold: "#FFC72C",
  cityMid: '#B8F49B',
  cityFade: '#F1FBEA',
  groceryTop: '#76EC00',
  groceryMid: '#B8F49B',
  groceryFade: '#F1FBEA',
  shopsTop: '#76EC00',
  shopsMid: '#B8F49B',
  shopsFade: '#F1FBEA',
  careTop: '#76EC00',
  careMid: '#B8F49B',
  careFade: '#F1FBEA',
  bookTop: '#76EC00',
  bookMid: '#B8F49B',
  bookFade: '#F1FBEA',
  foodTop: '#76EC00',
  foodMid: '#B8F49B',
  foodFade: '#F1FBEA',
  glass: 'rgba(255,255,255,0.6)',
  glassBright: 'rgba(255,255,255,0.88)',
  glassLine: 'rgba(255,255,255,0.7)',
  inkSoft: '#416034',
  shadow: 'rgba(30,64,30,0.07)',
  walletInk: '#253E26',
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
  sm: 14,
  md: 22,
  lg: 28,
  pill: 999,
};
