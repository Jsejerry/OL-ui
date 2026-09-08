import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@/src/theme";
import { api, Category } from "@/src/api";

const TAB_BAR_H = 64;

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api<Category[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="categories-screen">
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>All Categories</Text>
        <Text style={styles.subtitle}>Shop everything you need</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: TAB_BAR_H + 24 }}>
        <View style={styles.grid}>
          {categories.map((c) => {
            const bg = (colors as any)[c.color] ?? colors.surfaceSecondary;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.tile, { backgroundColor: bg }]}
                onPress={() => router.push(`/category/${c.id}` as any)}
                testID={`cat-${c.id}`}
              >
                <Text style={styles.emoji}>{c.emoji}</Text>
                <Text style={styles.name}>{c.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 22, fontWeight: "800", color: colors.onSurface },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  tile: {
    width: "47.5%",
    aspectRatio: 1.2,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  emoji: { fontSize: 44, marginBottom: spacing.sm },
  name: { fontSize: 14, fontWeight: "700", color: colors.onSurface, textAlign: "center" },
});
