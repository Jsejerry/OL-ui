import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '@react-native-vector-icons/ionicons';
import { colors } from '@/src/theme';
import { departments } from '@/src/departments';
import { useCatalog } from '@/src/use-catalog';
import { CategoryRail, LoadState } from '@/src/components/catalog-sections';
export default function Categories() {
  const router = useRouter();
  const { data, isError, refetch } = useCatalog();
  if (!data) return <LoadState error={isError} retry={refetch} />;
  return <ScrollView testID="categories-screen" contentContainerStyle={styles.content}><Text testID="categories-title" style={styles.title}>A whole city to explore.</Text><Text style={styles.subtitle}>Five worlds. One Latur.</Text>
    {departments.map(d => <View key={d.id} style={styles.section}><Pressable testID={`category-department-${d.id}`} style={[styles.heading, { backgroundColor: d.soft }]} onPress={() => router.navigate(d.route as any)}><Icon name={d.icon as any} size={23} color={d.color} /><Text style={[styles.name, { color: d.color }]}>{d.label}</Text><Icon name="arrow-forward" size={20} color={d.color} /></Pressable>{d.id === 'book-it' ? <View style={styles.bookLinks}>{['Movies', 'Events', 'Activities'].map(kind => <Pressable testID={`category-book-${kind.toLowerCase()}`} key={kind} onPress={() => router.navigate(`/book-it?kind=${kind.toLowerCase()}` as any)} style={styles.bookLink}><Text style={styles.bookText}>{kind}</Text><Icon name="arrow-forward" size={14} color={colors.book} /></Pressable>)}</View> : <CategoryRail categories={data.categories.filter(c => c.department === d.id)} scope={`all-${d.id}`} />}</View>)}
  </ScrollView>;
}
const styles = StyleSheet.create({
  content: { paddingBottom: 36, backgroundColor: colors.surface },
  title: { marginHorizontal: 20, marginTop: 25, fontSize: 29, color: colors.onSurface, fontWeight: '700', letterSpacing: -1, maxWidth: 250 },
  subtitle: { marginHorizontal: 20, color: colors.muted, fontSize: 13, marginTop: 8 }, section: { marginTop: 27 },
  heading: { marginHorizontal: 20, padding: 15, borderRadius: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { flex: 1, fontSize: 18, fontWeight: '700' }, bookLinks: { paddingHorizontal: 20, gap: 8 },
  bookLink: { padding: 16, minHeight: 48, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.bookSoft, borderRadius: 12 }, bookText: { color: colors.book, fontWeight: '600' },
});