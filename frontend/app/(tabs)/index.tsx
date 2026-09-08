import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/ionicons";
import { colors, radius, spacing } from "@/src/theme";
import { api, Banner, Category, DiscoverChip, Product, Store } from "@/src/api";
import { ProductCard } from "@/src/components/product-card";
import { useFollowedStores } from "@/src/followed";

const TAB_BAR_H = 64;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isFollowing } = useFollowedStores();
  const [chips, setChips] = useState<DiscoverChip[]>([]);
  const [activeChip, setActiveChip] = useState<string>("d1");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [buyAgain, setBuyAgain] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api<DiscoverChip[]>("/discover").then(setChips).catch(() => {});
    api<Banner[]>("/banners").then(setBanners).catch(() => {});
    api<Category[]>("/categories").then(setCategories).catch(() => {});
    api<Product[]>("/products/buy-again").then(setBuyAgain).catch(() => {});
    api<Product[]>("/products").then(setProducts).catch(() => {});
    api<Store[]>("/stores").then(setStores).catch(() => {});
  }, []);

  const filtered = query
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : products;

  const followedStores = stores.filter((s) => isFollowing(s.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="home-screen">
      {/* Sticky Location + Search Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.locationRow}>
          <View style={styles.locationLeft}>
            <View style={styles.deliveryBadge}>
              <Text style={styles.deliveryBadgeText}>⚡ 10 min</Text>
            </View>
            <View style={{ marginTop: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.locationTitle}>Home</Text>
                <Icon name="chevron-down" size={16} color={colors.onBrandPrimary} />
              </View>
              <Text style={styles.locationSub} numberOfLines={1}>Latur, Maharashtra 413512</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileCircle} testID="header-profile-btn" onPress={() => router.push("/account" as any)}>
            <Icon name="person-outline" size={20} color={colors.onBrandPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder='Search "milk"'
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            testID="home-search-input"
          />
          <Icon name="mic-outline" size={18} color={colors.muted} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_H + 24 }}
      >
        {/* Discover chips - horizontal scroll */}
        <View style={styles.discoverWrap}>
          <Text style={styles.sectionTitle}>Discover</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {chips.map((c) => {
              const active = activeChip === c.id;
              const bg = (colors as any)[c.color] ?? colors.surfaceSecondary;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setActiveChip(c.id)}
                  style={[
                    styles.chip,
                    { backgroundColor: bg },
                    active && { borderColor: colors.brandPrimary, borderWidth: 1.5 },
                  ]}
                  testID={`discover-chip-${c.id}`}
                >
                  <Text style={styles.chipEmoji}>{c.emoji}</Text>
                  <Text style={styles.chipText}>{c.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Followed stores rail */}
        {followedStores.length > 0 && (
          <View style={styles.section}>
            <View style={styles.rowHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Icon name="heart" size={16} color={colors.onError} />
                <Text style={styles.sectionTitleInline}>Stores you follow</Text>
              </View>
              <Text style={styles.link}>{followedStores.length}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
            >
              {followedStores.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.followedCard}
                  onPress={() => router.push(`/store/${s.id}` as any)}
                  testID={`followed-store-${s.id}`}
                >
                  <Image source={s.logo} style={styles.followedLogo} contentFit="cover" />
                  <Text style={styles.followedName} numberOfLines={1}>{s.name}</Text>
                  <Text style={styles.followedMeta}>⚡ {s.delivery_time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Banners */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
          style={{ marginTop: spacing.md }}
        >
          {banners.map((b) => {
            const bg = (colors as any)[b.bg] ?? colors.pastelYellow;
            return (
              <View key={b.id} style={[styles.banner, { backgroundColor: bg }]} testID={`banner-${b.id}`}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>{b.title}</Text>
                  <Text style={styles.bannerSub}>{b.subtitle}</Text>
                  <View style={styles.bannerCta}>
                    <Text style={styles.bannerCtaText}>Shop now →</Text>
                  </View>
                </View>
                <Image source={b.image} style={styles.bannerImg} contentFit="cover" />
              </View>
            );
          })}
        </ScrollView>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <View style={styles.catGrid}>
            {categories.map((c) => {
              const bg = (colors as any)[c.color] ?? colors.surfaceSecondary;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catTile, { backgroundColor: bg }]}
                  onPress={() => router.push(`/category/${c.id}` as any)}
                  testID={`category-tile-${c.id}`}
                >
                  <Text style={styles.catEmoji}>{c.emoji}</Text>
                  <Text style={styles.catName} numberOfLines={2}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Buy Again */}
        {buyAgain.length > 0 && (
          <View style={styles.section}>
            <View style={styles.rowHeader}>
              <Text style={styles.sectionTitleInline}>Buy Again</Text>
              <Text style={styles.link}>See all</Text>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={buyAgain}
              keyExtractor={(i) => i.id}
              contentContainerStyle={{ paddingHorizontal: spacing.lg }}
              renderItem={({ item }) => <ProductCard product={item} />}
            />
          </View>
        )}

        {/* Stores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Stores</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
          >
            {stores.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.storeCard}
                onPress={() => router.push(`/store/${s.id}` as any)}
                testID={`store-card-${s.id}`}
              >
                <Image source={s.logo} style={styles.storeLogo} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.storeName} numberOfLines={1}>{s.name}</Text>
                  <Text style={styles.storeMeta}>⚡ {s.delivery_time} · ⭐ {s.rating}</Text>
                  <Text style={styles.storeTag} numberOfLines={1}>{s.tagline}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* All products grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{query ? `Results for "${query}"` : "Fresh Picks"}</Text>
          <View style={styles.grid}>
            {filtered.map((p) => (
              <View key={p.id} style={styles.gridItem}>
                <ProductCard product={p} width={undefined as any} />
              </View>
            ))}
            {filtered.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  locationRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  locationLeft: { flex: 1 },
  deliveryBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  deliveryBadgeText: { fontSize: 11, fontWeight: "800", color: colors.onBrandSecondary },
  locationTitle: { color: colors.onBrandPrimary, fontSize: 18, fontWeight: "800", marginRight: 4 },
  locationSub: { color: "#B8B8B8", fontSize: 12, marginTop: 2 },
  profileCircle: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: "#3a3a3a",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#2a2a2a",
  },
  searchBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: colors.onSurface, fontSize: 14 },
  section: { marginTop: spacing.xl },
  discoverWrap: { marginTop: spacing.lg },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: {
    fontSize: 16, fontWeight: "800",
    color: colors.onSurface,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitleInline: { fontSize: 16, fontWeight: "800", color: colors.onSurface },
  chipRow: { paddingHorizontal: spacing.lg, gap: spacing.sm, flexDirection: "row" },
  chip: {
    height: 36,
    flexShrink: 0,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipEmoji: { fontSize: 14 },
  chipText: { fontSize: 13, fontWeight: "700", color: colors.onSurface },
  banner: {
    width: 300,
    height: 130,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  bannerTitle: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  bannerSub: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 4 },
  bannerCta: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  bannerCtaText: { color: colors.onBrandPrimary, fontSize: 12, fontWeight: "700" },
  bannerImg: { width: 100, height: 100, borderRadius: radius.md },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  catTile: {
    width: "22.5%",
    aspectRatio: 0.85,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  catEmoji: { fontSize: 28, marginBottom: 4 },
  catName: { fontSize: 11, fontWeight: "700", color: colors.onSurface, textAlign: "center" },
  storeCard: {
    width: 240,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  storeLogo: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceSecondary },
  storeName: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  storeMeta: { fontSize: 11, color: colors.muted, marginTop: 2 },
  storeTag: { fontSize: 11, color: colors.onSurfaceSecondary, marginTop: 2 },
  followedCard: {
    width: 88,
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.pastelPink,
  },
  followedLogo: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.surface },
  followedName: { fontSize: 11, fontWeight: "800", color: colors.onSurface, marginTop: 6, textAlign: "center" },
  followedMeta: { fontSize: 10, color: colors.muted, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: spacing.lg, gap: spacing.md },
  gridItem: { width: "47.5%" },
  link: { fontSize: 13, color: colors.brandPrimary, fontWeight: "700" },
  empty: { width: "100%", padding: spacing.xl, alignItems: "center" },
  emptyText: { color: colors.muted, fontSize: 14 },
});
