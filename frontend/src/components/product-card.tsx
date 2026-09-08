import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing } from "@/src/theme";
import { useCart } from "@/src/cart";
import type { Product } from "@/src/api";

export function ProductCard({ product, width = 150 }: { product: Product; width?: number }) {
  const router = useRouter();
  const { add, remove, qtyOf } = useCart();
  const qty = qtyOf(product.id);

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}` as any)}
      style={[styles.card, width ? { width } : null]}
      testID={`product-card-${product.id}`}
    >
      <View style={styles.imgWrap}>
        <Image source={product.image} style={styles.img} contentFit="cover" transition={200} />
        {product.discount_pct ? (
          <View style={styles.discount}>
            <Text style={styles.discountText}>{product.discount_pct}% OFF</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.deliveryPill}>
        <Text style={styles.deliveryText}>⚡ {product.delivery_min} MIN</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
      <Text style={styles.weight}>{product.weight}</Text>
      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.mrp > product.price ? (
            <Text style={styles.mrp}>₹{product.mrp}</Text>
          ) : null}
        </View>
        {qty === 0 ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              Haptics.selectionAsync();
              add(product);
            }}
            style={styles.addBtn}
            testID={`add-btn-${product.id}`}
          >
            <Text style={styles.addText}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.stepper} testID={`stepper-${product.id}`}>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); remove(product.id); }}
              style={styles.stepBtn}
              testID={`dec-${product.id}`}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); add(product); }}
              style={styles.stepBtn}
              testID={`inc-${product.id}`}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imgWrap: {
    width: "100%",
    height: 110,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceSecondary,
    overflow: "hidden",
    marginBottom: spacing.xs,
    position: "relative",
  },
  img: { width: "100%", height: "100%" },
  discount: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: { color: colors.onBrandPrimary, fontSize: 10, fontWeight: "700" },
  deliveryPill: {
    backgroundColor: colors.pastelYellow,
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  deliveryText: { fontSize: 9, color: colors.onSurface, fontWeight: "700" },
  name: { fontSize: 13, color: colors.onSurface, fontWeight: "600", minHeight: 34 },
  weight: { fontSize: 11, color: colors.muted, marginBottom: spacing.xs },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontSize: 14, fontWeight: "700", color: colors.onSurface },
  mrp: { fontSize: 11, color: colors.muted, textDecorationLine: "line-through" },
  addBtn: {
    borderWidth: 1.5,
    borderColor: colors.brandPrimary,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  addText: { color: colors.brandPrimary, fontWeight: "700", fontSize: 12 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  stepBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  stepBtnText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 14 },
  qtyText: { color: colors.onBrandPrimary, fontWeight: "700", fontSize: 12, minWidth: 16, textAlign: "center" },
});
