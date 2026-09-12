import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Icon from '@react-native-vector-icons/ionicons';
import { colors } from '@/src/theme';
import { useCatalog } from '@/src/use-catalog';
import { CityScroll } from '@/src/motion';
import { BrandRail, EventRail, LoadState, ProductRail, SectionTitle } from '@/src/components/catalog-sections';
import { StoreRail } from '@/src/components/store-rail';
import { Category } from '@/src/api';

const groups = [
  { id: 'fresh', title: 'Fresh little beginnings', subtitle: 'From the farm to your everyday.', ids: ['c1', 'c2', 'c5', 'c24'] },
  { id: 'pantry', title: 'Grocery & kitchen', subtitle: 'A well-stocked kind of happy.', ids: ['c25', 'c26', 'c23', 'c6'] },
  { id: 'snacks', title: 'Snacks, sips & sweet things', subtitle: 'For the in-between moments.', ids: ['c3', 'c4', 'c29', 'c32'] },
  { id: 'festive', title: 'Celebrate a little more', subtitle: 'Bappa’s favourites to garba-night essentials.', ids: ['c21', 'c22', 'c23', 'c32'] },
  { id: 'food', title: 'Cravings, taken care of', subtitle: 'A delicious detour.', ids: ['c9', 'c10', 'c11', 'c12'] },
  { id: 'fitness', title: 'Move. Fuel. Feel good.', subtitle: 'Find your everyday strong.', ids: ['c28', 'c27', 'c24', 'c18'] },
  { id: 'care', title: 'Your feel-good routine', subtitle: 'A little care, from head to toe.', ids: ['c15', 'c16', 'c17', 'c31'] },
  { id: 'home', title: 'Home, health & little upgrades', subtitle: 'All the useful things, together.', ids: ['c30', 'c14', 'c13', 'c20', 'c19', 'c7', 'c8'] },
];
function CategoryTiles({ categories, scope }: { categories: Category[]; scope: string }) {
  const router = useRouter();
  return <View style={styles.grid}>{categories.map(c => <Pressable testID={`${scope}-category-${c.id}`} key={c.id} onPress={() => router.push(`/category/${c.id}` as any)} style={({ pressed }) => [styles.tile, pressed && styles.pressed]}><View style={styles.tileArt}><Image testID={`${scope}-category-image-${c.id}`} source={c.image} contentFit="contain" style={styles.tileImage} transition={160} /></View><Text testID={`${scope}-category-label-${c.id}`} style={styles.tileLabel}>{c.name}</Text></Pressable>)}</View>;
}
export default function Categories() {
  const { data, isError, refetch } = useCatalog(); const router = useRouter();
  if (!data) return <LoadState error={isError} retry={refetch} />;
  return <CityScroll testID="categories-screen" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.intro}><View style={styles.introCopy}><Text testID="categories-eyebrow" style={styles.eyebrow}>LITTLE FINDS. ENDLESS POSSIBILITIES.</Text><Text testID="categories-title" style={styles.title}>Your city, by category.</Text></View><Pressable testID="categories-search" accessibilityLabel="Search categories and products" style={styles.search} onPress={() => router.push('/search')}><Icon name="search-outline" size={21} color={colors.forest} /></Pressable></View>
    <SectionTitle id="shop-by-store" title="Shop by Store" subtitle="Five little worlds. Which one is yours?" /><StoreRail stores={data.themed_stores || []} />
    <Pressable testID="categories-festive-banner" onPress={() => router.push('/collection/festive' as any)} style={({ pressed }) => [styles.banner, pressed && styles.pressed]}><View style={styles.bannerCopy}><Text style={styles.eyebrow}>THE CELEBRATION EDIT</Text><Text style={styles.bannerTitle}>Big festive energy. Little joyful finds.</Text><View style={styles.bannerLink}><Text style={styles.link}>Step into Festive Time</Text><Icon name="arrow-forward" size={15} color={colors.forest} /></View></View><Image testID="categories-festive-art" source={data.themed_stores?.[0]?.image} style={styles.bannerArt} contentFit="cover" /></Pressable>
    {groups.map((group, i) => <View key={group.id}><SectionTitle id={`categories-${group.id}`} title={group.title} subtitle={group.subtitle} /><CategoryTiles scope={`grid-${group.id}`} categories={group.ids.flatMap(id => data.categories.filter(c => c.id === id))} />
      {i === 1 && <><SectionTitle id="category-quick-picks" title="Small prices. Lovely finds." subtitle="Every pick under ₹99 · sample prices" onPress={() => router.push('/search?collection=budget' as any)} /><ProductRail products={data.products.filter(p => p.price < 99).slice(-8)} scope="category-budget" /></>}
      {i === 4 && <><SectionTitle id="category-brands" title="The brands you keep coming back to" subtitle={`${data.brands.length} demo brand collections to explore`} /><BrandRail brands={data.brands.slice(16, 31)} scope="categories-brands" /></>}
    </View>)}
    <SectionTitle id="categories-more-brands" title="More brands, more favourites" /><BrandRail brands={data.brands.slice(31).concat(data.brands.slice(0, 16))} scope="categories-more" />
    <SectionTitle id="categories-book" title="Make a little time for fun" subtitle="Movies, music and a change of scene." onPress={() => router.navigate('/book-it')} /><EventRail events={data.events} scope="categories-book" />
    <Pressable testID="categories-ask-one" onPress={() => router.push('/assistant')} style={styles.assistant}><Icon name="sparkles" size={24} color={colors.lime} /><View style={styles.assistantCopy}><Text style={styles.assistantTitle}>Not sure where to start?</Text><Text style={styles.assistantText}>Tell One your budget. Find your little favourites.</Text></View><Icon name="arrow-forward" size={20} color={colors.lime} /></Pressable>
    <Text testID="categories-demo-note" style={styles.note}>Made for Latur. Curated for you. Demo brand listings, illustrative images and sample prices.</Text>
  </CityScroll>;
}
const styles = StyleSheet.create({ content: { backgroundColor: colors.surface }, intro: { paddingHorizontal: 20, paddingTop: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, introCopy: { flex: 1 }, eyebrow: { fontSize: 8, letterSpacing: 1.4, fontWeight: '700', color: colors.inkSoft }, title: { fontSize: 25, letterSpacing: -0.9, fontWeight: '700', color: colors.onSurface, marginTop: 7 }, search: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.limeSoft, alignItems: 'center', justifyContent: 'center' }, grid: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 }, tile: { width: '25%', paddingHorizontal: 4, alignItems: 'center' }, tileArt: { width: '100%', aspectRatio: 1, borderRadius: 20, backgroundColor: colors.cream, overflow: 'hidden' }, tileImage: { width: '100%', height: '100%' }, tileLabel: { fontSize: 11, lineHeight: 15, textAlign: 'center', fontWeight: '600', color: colors.onSurface, marginTop: 8, minHeight: 30 }, pressed: { opacity: 0.75, transform: [{ scale: 0.95 }] }, banner: { marginHorizontal: 18, marginTop: 28, borderRadius: 26, overflow: 'hidden', backgroundColor: colors.limeSoft, flexDirection: 'row', minHeight: 145 }, bannerCopy: { flex: 1, paddingLeft: 18, paddingVertical: 20, zIndex: 1 }, bannerTitle: { fontSize: 19, lineHeight: 25, fontWeight: '700', color: colors.forest, marginTop: 9 }, bannerLink: { flexDirection: 'row', gap: 5, alignItems: 'center', marginTop: 12 }, link: { fontSize: 10, fontWeight: '600', color: colors.forest }, bannerArt: { width: '39%', height: '100%' }, assistant: { marginHorizontal: 20, marginTop: 30, padding: 20, borderRadius: 25, backgroundColor: colors.forestDeep, flexDirection: 'row', alignItems: 'center', gap: 13 }, assistantCopy: { flex: 1 }, assistantTitle: { color: colors.surface, fontSize: 14, fontWeight: '700' }, assistantText: { color: colors.cityMid, fontSize: 10, lineHeight: 16, marginTop: 5 }, note: { fontSize: 10, lineHeight: 18, textAlign: 'center', color: colors.muted, marginTop: 26, paddingHorizontal: 30 } });