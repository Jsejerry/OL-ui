import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Icon from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { colors } from '../theme';
import { departments, DepartmentId } from '../departments';
import { mediaUrl } from '../api';
import { useCatalog } from '../use-catalog';
import { BrandRail, CategoryRail, LoadState, SectionTitle } from './catalog-sections';
import { ProductCard } from './product-card';

export function DepartmentScreen({ id }: { id: DepartmentId }) {
  const d = departments.find(x => x.id === id)!;
  const { data, isError, refetch } = useCatalog();
  const [filter, setFilter] = useState('All');
  const [brand, setBrand] = useState('');
  const router = useRouter();
  const width = useWindowDimensions().width;
  if (!data) return <LoadState error={isError} retry={refetch} />;
  const brands = data.brands.filter(b => b.department === id);
  const categories = data.categories.filter(c => c.department === id);
  const products = data.products.filter(p => p.department === id && (!brand || p.brand_id === brand) && (filter === 'All' || data.categories.find(c => c.id === p.category_id)?.name.toLowerCase().includes(filter.toLowerCase())));
  const columns = width > 600 ? 3 : 2;
  const cardWidth = (width - 40 - 12 * (columns - 1)) / columns;
  return <ScrollView testID={`department-screen-${id}`} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { backgroundColor: id === 'beauty' ? colors.beautySoft : colors.surface }]}>
    <View style={[styles.hero, { backgroundColor: d.soft }]}>
      <View style={styles.heroCopy}><Text style={[styles.eyebrow, { color: d.color }]}>{d.eyebrow}</Text><Text testID={`${id}-title`} style={[styles.title, { color: d.color }, id === 'beauty' && styles.beautyTitle]}>{d.title}</Text><Text style={styles.subtitle}>{d.subtitle}</Text></View>
      <Image source={mediaUrl(d.image)} style={[styles.heroImage, id === 'beauty' && styles.beautyImage]} contentFit="cover" />
    </View>
    <View style={[styles.benefits, { backgroundColor: d.soft }]}><Icon name={id === 'food' ? 'restaurant-outline' : id === 'pharmacy' ? 'heart-outline' : id === 'beauty' ? 'sparkles-outline' : 'leaf-outline'} size={16} color={d.color} /><Text style={[styles.benefitsText, { color: d.color }]}>{id === 'food' ? 'Your favourites, freshly made' : id === 'pharmacy' ? 'Personal care & wellness essentials' : id === 'beauty' ? 'Good skin days start here' : 'Freshly picked. Thoughtfully priced.'}</Text></View>
    {brands.length > 0 ? <><SectionTitle title={id === 'food' ? 'Your favourite brands' : 'The brands you love'} id={`${id}-brands`} subtitle="Explore sample brand collections" /><BrandRail brands={brands} scope={`${id}-page`} onSelect={value => setBrand(brand === value ? '' : value)} active={brand} /></> : <><SectionTitle title="Stock up on the good stuff" id="grocery-categories" /><CategoryRail categories={categories} scope="grocery-page" /></>}
    <SectionTitle id={`${id}-products`} title={brand ? brands.find(b => b.id === brand)?.name || 'Picks for you' : id === 'food' ? 'A menu made for your mood' : id === 'beauty' ? 'The glow-up essentials' : id === 'pharmacy' ? 'Your everyday care cabinet' : 'Fresh on the shelves'} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{d.filters.map(f => <Pressable key={f} testID={`${id}-filter-${f.toLowerCase().replaceAll(' ', '-')}`} onPress={() => setFilter(f)} style={[styles.filter, filter === f && { backgroundColor: d.color, borderColor: d.color }]}><Text style={[styles.filterText, filter === f && styles.selectedText]}>{f}</Text></Pressable>)}</ScrollView>
    {!!brand && <View style={styles.brandActions}><Pressable testID={`${id}-clear-brand`} onPress={() => setBrand('')} style={styles.clear}><Icon name="close-circle" size={16} color={d.color} /><Text style={[styles.filterText, { color: d.color }]}>Clear brand</Text></Pressable><Pressable testID={`${id}-visit-store`} onPress={() => router.push(`/store/${brand}` as any)} style={styles.clear}><Text style={[styles.filterText, { color: d.color }]}>Visit store</Text><Icon name="arrow-forward" size={16} color={d.color} /></Pressable></View>}
    <View style={styles.grid}>{products.map(p => <ProductCard key={p.id} product={p} width={cardWidth} scope={id} />)}</View>
    {!products.length && <View testID={`${id}-empty-results`} style={styles.empty}><Text style={styles.subtitle}>No matches for these filters.</Text><Pressable testID={`${id}-reset-filters`} onPress={() => { setFilter('All'); setBrand(''); }} style={styles.clear}><Text style={styles.filterText}>Show all products</Text></Pressable></View>}
    <View style={styles.note}><Icon name="information-circle-outline" size={16} color={colors.muted} /><Text testID={`${id}-sample-notice`} style={styles.noteText}>{id === 'pharmacy' ? 'Sample wellness catalogue. Not medical advice. No prescription medicines are dispensed through this demo.' : 'Sample brand listings and illustrative photography. Availability and prices are for demonstration.'}</Text></View>
  </ScrollView>;
}
const styles = StyleSheet.create({
  content: { paddingBottom: 32 }, hero: { margin: 20, marginBottom: 0, borderRadius: 22, padding: 20, minHeight: 210, overflow: 'hidden', flexDirection: 'row', alignItems: 'center' }, heroCopy: { flex: 1, zIndex: 1 }, eyebrow: { fontSize: 8, fontWeight: '800', letterSpacing: 1.3 }, title: { fontSize: 28, lineHeight: 32, fontWeight: '800', letterSpacing: -1.2, marginTop: 15, maxWidth: 230 }, beautyTitle: { fontFamily: 'serif', fontStyle: 'italic', fontWeight: '500' }, subtitle: { fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 12, maxWidth: 180 }, heroImage: { width: 120, height: 150, borderRadius: 70, marginRight: -34, marginLeft: -25, transform: [{ rotate: '9deg' }] }, beautyImage: { borderRadius: 7, height: 165 }, benefits: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, marginHorizontal: 28, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, gap: 7 }, benefitsText: { fontSize: 10, fontWeight: '600' }, filters: { paddingHorizontal: 20, gap: 8, marginBottom: 18 }, filter: { minHeight: 44, paddingHorizontal: 17, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, filterText: { fontSize: 12, fontWeight: '600', color: colors.onSurface }, selectedText: { color: colors.surface }, grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 }, brandActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 }, clear: { minHeight: 44, alignItems: 'center', flexDirection: 'row', gap: 6 }, empty: { alignItems: 'center', padding: 20 }, note: { flexDirection: 'row', gap: 7, margin: 24, alignItems: 'flex-start' }, noteText: { flex: 1, color: colors.muted, fontSize: 10, lineHeight: 16 },
});