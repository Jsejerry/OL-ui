import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";
import { colors, radius, spacing } from "@/src/theme";

const TAB_BAR_H = 64;

const ROWS = [
  { icon: "receipt-outline", label: "My Orders", testID: "acc-orders", route: "/orders" },
  { icon: "location-outline", label: "Saved Addresses", testID: "acc-addresses" },
  { icon: "heart-outline", label: "Wishlist", testID: "acc-wishlist" },
  { icon: "gift-outline", label: "Refer & Earn", testID: "acc-refer" },
  { icon: "help-circle-outline", label: "Help & Support", testID: "acc-help" },
  { icon: "information-circle-outline", label: "About One Latur", testID: "acc-about" },
];

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary }} testID="account-screen">
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.avatar}><Text style={styles.avatarText}>C</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Customer</Text>
          <Text style={styles.meta}>customer@onelatur.com</Text>
        </View>
        <TouchableOpacity style={styles.editBtn} testID="edit-profile-btn">
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: TAB_BAR_H + 24 }}>
        <View style={styles.card}>
          {ROWS.map((r, i) => (
            <TouchableOpacity
              key={r.label}
              style={[styles.row, i !== ROWS.length - 1 && styles.rowBorder]}
              testID={r.testID}
              onPress={() => { if (r.route) router.push(r.route as any); }}
            >
              <View style={styles.rowIcon}>
                <Icon name={r.icon as any} size={20} color={colors.onSurface} />
              </View>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Icon name="chevron-forward" size={18} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.tag}>One Latur · Made in Latur</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.brandPrimary,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.brandSecondary, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 24, fontWeight: "800", color: colors.onBrandSecondary },
  name: { fontSize: 18, fontWeight: "800", color: colors.onBrandPrimary },
  meta: { fontSize: 12, color: "#B8B8B8", marginTop: 2 },
  editBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: "#3a3a3a" },
  editText: { color: colors.onBrandPrimary, fontWeight: "700", fontSize: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.pastelYellow, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.onSurface },
  tag: { textAlign: "center", color: colors.muted, marginTop: spacing.xl, fontSize: 12 },
});
