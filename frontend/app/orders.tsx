import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { Image } from "expo-image";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing } from "@/src/theme";
import { api, Order } from "@/src/api";
import { useCart } from "@/src/cart";

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { add } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [reordered, setReordered] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    setRefreshing(true);
    api<Order[]>("/orders")
      .then(setOrders)
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }, []);

  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  const reorder = (o: Order) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    o.items.forEach((it) => {
      for (let i = 0; i < it.qty; i++) add({ id: it.id, name: it.name, weight: it.weight, price: it.price, mrp: it.mrp, image: it.image });
    });
    setReordered(o.id);
    setTimeout(() => setReordered(null), 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary }} testID="orders-screen">
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="orders-back-btn">
          <Icon name="chevron-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.sub}>{orders.length} order{orders.length === 1 ? "" : "s"}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />}
      >
        {orders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>Your past orders will appear here</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace("/(tabs)" as any)}>
              <Text style={styles.shopBtnText}>Start shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((o) => (
            <View key={o.id} style={styles.card} testID={`order-${o.id}`}>
              <View style={styles.cardHead}>
                <View>
                  <Text style={styles.orderId}>#{o.id.slice(0, 8).toUpperCase()}</Text>
                  <Text style={styles.orderDate}>{new Date(o.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: colors.pastelGreen }]}>
                  <Text style={styles.statusText}>{o.status}</Text>
                </View>
              </View>

              <View style={styles.imgRow}>
                {o.items.slice(0, 4).map((i) => (
                  <Image key={i.id} source={i.image} style={styles.itemImg} contentFit="cover" />
                ))}
                {o.items.length > 4 && (
                  <View style={styles.moreBadge}>
                    <Text style={styles.moreText}>+{o.items.length - 4}</Text>
                  </View>
                )}
              </View>

              <View style={styles.footer}>
                <View>
                  <Text style={styles.total}>₹{o.total}</Text>
                  <Text style={styles.footerMeta}>{o.items.length} items</Text>
                </View>
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <TouchableOpacity style={styles.trackBtn} onPress={() => router.push(`/order/${o.id}` as any)} testID={`track-${o.id}`}>
                    <Icon name="location-outline" size={14} color={colors.onSurface} />
                    <Text style={styles.trackText}>Track</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reorderBtn} onPress={() => reorder(o)} testID={`reorder-${o.id}`}>
                    <Icon name={reordered === o.id ? "checkmark" : "repeat"} size={14} color={colors.onBrandPrimary} />
                    <Text style={styles.reorderText}>{reordered === o.id ? "Added" : "Reorder"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", color: colors.onSurface },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  empty: { alignItems: "center", padding: spacing.xl },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  emptySub: { fontSize: 13, color: colors.muted, marginTop: 4 },
  shopBtn: { marginTop: spacing.lg, backgroundColor: colors.brandPrimary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.pill },
  shopBtnText: { color: colors.onBrandPrimary, fontWeight: "800" },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  orderId: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  orderDate: { fontSize: 11, color: colors.muted, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  statusText: { fontSize: 11, fontWeight: "800", color: colors.onSuccess, textTransform: "capitalize" },
  imgRow: { flexDirection: "row", gap: 6, marginTop: spacing.md },
  itemImg: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceSecondary },
  moreBadge: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  moreText: { fontSize: 12, fontWeight: "800", color: colors.onSurface },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.md },
  total: { fontSize: 16, fontWeight: "800", color: colors.onSurface },
  footerMeta: { fontSize: 11, color: colors.muted, marginTop: 2 },
  trackBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  trackText: { fontSize: 12, fontWeight: "800", color: colors.onSurface },
  reorderBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.brandPrimary },
  reorderText: { fontSize: 12, fontWeight: "800", color: colors.onBrandPrimary },
});
