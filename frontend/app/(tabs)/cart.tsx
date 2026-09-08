import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing } from "@/src/theme";
import { useCart } from "@/src/cart";

const TAB_BAR_H = 64;

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items, add, remove, clear, totalItems, totalPrice, totalMrp } = useCart();
  const [placed, setPlaced] = useState(false);

  const savings = totalMrp - totalPrice;
  const deliveryFee = totalPrice > 199 || totalPrice === 0 ? 0 : 15;
  const grand = totalPrice + deliveryFee;

  const handleCheckout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPlaced(true);
    setTimeout(() => {
      clear();
      setPlaced(false);
    }, 1800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary }} testID="cart-screen">
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>My Cart</Text>
        <Text style={styles.subtitle}>{totalItems} item{totalItems === 1 ? "" : "s"}</Text>
      </View>

      {items.length === 0 && !placed ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add fresh items to get started</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.replace("/(tabs)" as any)} testID="browse-btn">
            <Text style={styles.browseText}>Browse products</Text>
          </TouchableOpacity>
        </View>
      ) : placed ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>✅</Text>
          <Text style={styles.emptyTitle}>Order placed!</Text>
          <Text style={styles.emptySub}>Delivering in 10 minutes to your home</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: TAB_BAR_H + 220 }}>
            {/* Delivery card */}
            <View style={styles.deliveryCard}>
              <Icon name="flash" size={22} color={colors.onSurface} />
              <View style={{ flex: 1 }}>
                <Text style={styles.deliveryTitle}>Delivery in 10 minutes</Text>
                <Text style={styles.deliverySub}>Shipping to Latur, MH 413512</Text>
              </View>
            </View>

            {deliveryFee > 0 && (
              <View style={styles.freeHint} testID="free-delivery-hint">
                <Icon name="rocket-outline" size={18} color={colors.onSurface} />
                <Text style={styles.freeHintText}>
                  Add ₹{Math.max(199 - totalPrice, 0)} more for FREE delivery
                </Text>
              </View>
            )}

            {/* Items */}
            <View style={styles.card}>
              {items.map((it) => (
                <View key={it.id} style={styles.row}>
                  <Image source={it.image} style={styles.itemImg} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName} numberOfLines={2}>{it.name}</Text>
                    <Text style={styles.itemWeight}>{it.weight}</Text>
                    <Text style={styles.itemPrice}>₹{it.price}</Text>
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity onPress={() => remove(it.id)} style={styles.stepBtn} testID={`cart-dec-${it.id}`}>
                      <Text style={styles.stepText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepQty}>{it.qty}</Text>
                    <TouchableOpacity onPress={() => add(it)} style={styles.stepBtn} testID={`cart-inc-${it.id}`}>
                      <Text style={styles.stepText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Bill details */}
            <View style={[styles.card, { marginTop: spacing.md }]}>
              <Text style={styles.billTitle}>Bill Details</Text>
              <BillRow label="Items total" value={`₹${totalMrp}`} strike />
              <BillRow label="Discount" value={`− ₹${savings}`} success />
              <BillRow label="Delivery fee" value={deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`} success={deliveryFee === 0} />
              <View style={styles.divider} />
              <BillRow label="Grand total" value={`₹${grand}`} strong />
              {savings > 0 && (
                <View style={styles.savings}>
                  <Text style={styles.savingsText}>🎉 You saved ₹{savings} on this order</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Sticky Checkout */}
          <View style={[styles.checkoutBar, { bottom: TAB_BAR_H + 8, marginHorizontal: spacing.lg }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkoutTotal}>₹{grand}</Text>
              <Text style={styles.checkoutMeta}>{totalItems} items · View bill</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} testID="checkout-btn">
              <Text style={styles.checkoutText}>Checkout</Text>
              <Icon name="arrow-forward" size={16} color={colors.onBrandPrimary} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function BillRow({ label, value, strong, success, strike }: { label: string; value: string; strong?: boolean; success?: boolean; strike?: boolean }) {
  return (
    <View style={billStyles.row}>
      <Text style={[billStyles.label, strong && billStyles.strong]}>{label}</Text>
      <Text style={[
        billStyles.value,
        strong && billStyles.strong,
        success && { color: colors.onSuccess },
        strike && { textDecorationLine: "line-through", color: colors.muted },
      ]}>{value}</Text>
    </View>
  );
}

const billStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  label: { fontSize: 13, color: colors.onSurfaceSecondary },
  value: { fontSize: 13, color: colors.onSurface, fontWeight: "600" },
  strong: { fontWeight: "800", fontSize: 15, color: colors.onSurface },
});

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.onSurface },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  emptySub: { fontSize: 13, color: colors.muted, marginTop: 4 },
  browseBtn: { marginTop: spacing.lg, backgroundColor: colors.brandPrimary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.pill },
  browseText: { color: colors.onBrandPrimary, fontWeight: "700" },
  deliveryCard: {
    backgroundColor: colors.pastelYellow,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  deliveryTitle: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  deliverySub: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  row: { flexDirection: "row", gap: spacing.md, alignItems: "center", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  itemImg: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.surfaceSecondary },
  itemName: { fontSize: 13, fontWeight: "600", color: colors.onSurface },
  itemWeight: { fontSize: 11, color: colors.muted, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "800", color: colors.onSurface, marginTop: 4 },
  stepper: { flexDirection: "row", alignItems: "center", backgroundColor: colors.brandPrimary, borderRadius: radius.sm, overflow: "hidden" },
  stepBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  stepText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 14 },
  stepQty: { color: colors.onBrandPrimary, fontWeight: "700", minWidth: 18, textAlign: "center" },
  billTitle: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
  savings: {
    marginTop: spacing.sm,
    backgroundColor: colors.pastelGreen,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  savingsText: { color: colors.onSuccess, fontSize: 12, fontWeight: "700" },
  freeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.pastelGreen,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  freeHintText: { color: colors.onSuccess, fontSize: 13, fontWeight: "700" },
  checkoutBar: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  checkoutTotal: { color: colors.onBrandPrimary, fontSize: 18, fontWeight: "800" },
  checkoutMeta: { color: "#B8B8B8", fontSize: 11, marginTop: 2 },
  checkoutBtn: { backgroundColor: colors.brandSecondary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.pill, flexDirection: "row", alignItems: "center", gap: 6 },
  checkoutText: { color: colors.onBrandSecondary, fontWeight: "800" },
});
