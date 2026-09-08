import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing } from "@/src/theme";
import { api, Product } from "@/src/api";
import { useCart } from "@/src/cart";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { add, remove, qtyOf, totalItems, totalPrice } = useCart();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!id) return;
    api<Product>(`/products/${id}`).then(setProduct).catch(() => {});
  }, [id]);

  if (!product) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}>
        <Text style={{ color: colors.muted }}>Loading...</Text>
      </View>
    );
  }

  const qty = qtyOf(product.id);
  const savings = product.mrp - product.price;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="product-detail">
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        testID="pd-back-btn"
      >
        <Icon name="chevron-back" size={22} color={colors.onSurface} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={[styles.imageWrap, { paddingTop: insets.top + 60 }]}>
          <Image source={product.image} style={styles.image} contentFit="cover" />
        </View>

        <View style={styles.content}>
          <View style={styles.deliveryPill}>
            <Icon name="flash" size={12} color={colors.onSurface} />
            <Text style={styles.deliveryText}>Delivery in {product.delivery_min} minutes</Text>
          </View>

          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.weight}>{product.weight}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.mrp > product.price && (
              <>
                <Text style={styles.mrp}>₹{product.mrp}</Text>
                <View style={styles.savingsPill}>
                  <Text style={styles.savingsText}>Save ₹{savings}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Why you&apos;ll love it</Text>
          <View style={styles.featureList}>
            <Feature icon="leaf-outline" title="Farm fresh" text="Sourced locally in Latur" />
            <Feature icon="checkmark-done-outline" title="Quality checked" text="Inspected before delivery" />
            <Feature icon="flash-outline" title="10-min delivery" text="From our nearest partner store" />
            <Feature icon="shield-checkmark-outline" title="Easy returns" text="Not happy? Return on the spot" />
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        {totalItems > 0 && (
          <View style={styles.cartPreview}>
            <Text style={styles.cartMeta}>{totalItems} in cart · ₹{totalPrice}</Text>
            <TouchableOpacity onPress={() => router.push("/cart" as any)} testID="pd-view-cart">
              <Text style={styles.cartLink}>View cart →</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.actionRow}>
          {qty === 0 ? (
            <TouchableOpacity
              style={styles.addCta}
              onPress={() => { Haptics.selectionAsync(); add(product); }}
              testID="pd-add-btn"
            >
              <Icon name="cart" size={18} color={colors.onBrandPrimary} />
              <Text style={styles.addCtaText}>Add to Cart · ₹{product.price}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stepperLarge}>
              <TouchableOpacity onPress={() => remove(product.id)} style={styles.stepBtnLg} testID="pd-dec">
                <Text style={styles.stepBtnLgText}>−</Text>
              </TouchableOpacity>
              <View style={styles.stepQtyWrap}>
                <Text style={styles.stepQtyLg}>{qty} in cart</Text>
              </View>
              <TouchableOpacity onPress={() => add(product)} style={styles.stepBtnLg} testID="pd-inc">
                <Text style={styles.stepBtnLgText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function Feature({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <View style={styles.feature}>
      <View style={styles.featIcon}>
        <Icon name={icon as any} size={20} color={colors.onSurface} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featTitle}>{title}</Text>
        <Text style={styles.featText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute", left: spacing.lg,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center", zIndex: 10,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 4,
  },
  imageWrap: {
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  image: { width: 240, height: 240, borderRadius: radius.lg, backgroundColor: colors.surface },
  content: { padding: spacing.lg },
  deliveryPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.pastelYellow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  deliveryText: { fontSize: 12, fontWeight: "700", color: colors.onSurface },
  name: { fontSize: 22, fontWeight: "800", color: colors.onSurface },
  weight: { fontSize: 14, color: colors.muted, marginTop: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.md },
  price: { fontSize: 26, fontWeight: "800", color: colors.onSurface },
  mrp: { fontSize: 16, color: colors.muted, textDecorationLine: "line-through" },
  savingsPill: { backgroundColor: colors.pastelGreen, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  savingsText: { color: colors.onSuccess, fontSize: 12, fontWeight: "800" },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.onSurface, marginBottom: spacing.md },
  featureList: { gap: spacing.md },
  feature: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  featIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.pastelMint, alignItems: "center", justifyContent: "center" },
  featTitle: { fontSize: 14, fontWeight: "700", color: colors.onSurface },
  featText: { fontSize: 12, color: colors.muted, marginTop: 2 },
  bottomBar: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  cartPreview: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  cartMeta: { fontSize: 12, color: colors.muted, fontWeight: "600" },
  cartLink: { fontSize: 13, fontWeight: "800", color: colors.brandPrimary },
  actionRow: {},
  addCta: {
    backgroundColor: colors.brandPrimary,
    height: 52,
    borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  addCtaText: { color: colors.onBrandPrimary, fontSize: 15, fontWeight: "800" },
  stepperLarge: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  stepBtnLg: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  stepBtnLgText: { color: colors.onBrandPrimary, fontSize: 22, fontWeight: "800" },
  stepQtyWrap: { flex: 1, alignItems: "center" },
  stepQtyLg: { color: colors.onBrandPrimary, fontSize: 15, fontWeight: "800" },
});
