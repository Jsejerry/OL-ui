import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";
import { colors, radius, spacing } from "@/src/theme";
import { api, Category, Product } from "@/src/api";
import { ProductCard } from "@/src/components/product-card";

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [cat, setCat] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) return;
    api<Category[]>("/categories").then((all) => {
      setCat(all.find((c) => c.id === id) ?? null);
    });
    api<Product[]>(`/products?category_id=${id}`).then(setProducts);
  }, [id]);

  const bg = cat ? ((colors as any)[cat.color] ?? colors.surfaceSecondary) : colors.surfaceSecondary;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="category-screen">
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: bg }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} testID="cat-back-btn">
          <Icon name="chevron-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{cat?.name ?? "Category"}</Text>
          <Text style={styles.sub}>{products.length} products</Text>
        </View>
        <Text style={styles.emoji}>{cat?.emoji}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}>
        <View style={styles.grid}>
          {products.map((p) => (
            <View key={p.id} style={styles.gridItem}>
              <ProductCard product={p} width={undefined as any} />
            </View>
          ))}
          {products.length === 0 && (
            <View style={styles.empty}>
              <Text style={{ color: colors.muted }}>No products yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "800", color: colors.onSurface },
  sub: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 2 },
  emoji: { fontSize: 44 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  gridItem: { width: "47.5%" },
  empty: { width: "100%", padding: spacing.xl, alignItems: "center" },
});
