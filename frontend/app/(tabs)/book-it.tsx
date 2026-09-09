import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '@react-native-vector-icons/ionicons';
import { colors } from '@/src/theme';
import { mediaUrl } from '@/src/api';
import { useCatalog } from '@/src/use-catalog';
import { EventRail, LoadState, SectionTitle } from '@/src/components/catalog-sections';
export default function BookIt() {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const [filter, setFilter] = useState(kind || 'all');
  useEffect(() => { if (kind) setFilter(kind); }, [kind]);
  const { data, isError, refetch } = useCatalog();
  const router = useRouter();
  if (!data) return <LoadState error={isError} retry={refetch} />;
  return <ScrollView testID="department-screen-book-it" showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.hero}><Image source={mediaUrl('concert')} style={StyleSheet.absoluteFill} contentFit="cover" /><LinearGradient colors={[colors.transparent, colors.bookDark]} style={StyleSheet.absoluteFill} /><View style={styles.heroText}><Text style={styles.eyebrow}>YOUR CITY. YOUR PLANS.</Text><Text testID="book-it-title" style={styles.title}>Go out. Make{ '\n' }memories.</Text><Text style={styles.subtitle}>Big screens. Live scenes. Good times.</Text></View><View style={styles.badge}><Icon name="ticket-outline" size={14} color={colors.lime} /><Text style={styles.badgeText}>BOOK IT</Text></View></View>
    <View style={styles.filters}>{[{ id: 'all', name: 'Explore', icon: 'compass-outline' }, { id: 'movies', name: 'Movies', icon: 'film-outline' }, { id: 'events', name: 'Events', icon: 'musical-notes-outline' }, { id: 'activities', name: 'Activities', icon: 'bicycle-outline' }].map(f => <Pressable testID={`book-filter-${f.id}`} key={f.id} onPress={() => setFilter(f.id)} style={[styles.filter, filter === f.id && styles.selected]}><Icon name={f.icon as any} size={23} color={filter === f.id ? colors.surface : colors.book} /><Text style={[styles.filterText, filter === f.id && styles.white]}>{f.name}</Text></Pressable>)}</View>
    {(filter === 'all' || filter === 'movies') && <><SectionTitle id="book-movies" title="A date with the big screen" subtitle="Sample movie listings · choose your show" /><EventRail events={data.events.filter(e => e.kind === 'movies')} scope="book-movies" /></>}
    {(filter === 'all' || filter === 'events') && <><SectionTitle id="book-events" title="Be there. Feel it live." subtitle="Music, culture and something different" /><EventRail events={data.events.filter(e => e.kind === 'events')} scope="book-events" /></>}
    {(filter === 'all' || filter === 'activities') && <><SectionTitle id="book-activities" title="A little adventure awaits" subtitle="Make your next weekend count" /><EventRail events={data.events.filter(e => e.kind === 'activities')} scope="book-activities" /></>}
    <Pressable testID="book-view-enquiries" onPress={() => router.push('/enquiries' as any)} style={styles.enquiries}><Icon name="ticket-outline" size={22} color={colors.book} /><View style={styles.flex}><Text style={styles.enquiryTitle}>Your saved enquiries</Text><Text style={styles.enquirySub}>Keep your plans in one place</Text></View><Icon name="arrow-forward" size={20} color={colors.book} /></Pressable>
    <Text testID="booking-demo-notice" style={styles.notice}>Demo experiences only. Enquiries are saved in the app; no tickets are issued, payments taken or venues contacted.</Text>
  </ScrollView>;
}
const styles = StyleSheet.create({ content: { paddingBottom: 32, backgroundColor: colors.surface }, hero: { height: 250, margin: 20, marginBottom: 0, borderRadius: 23, overflow: 'hidden', backgroundColor: colors.bookDark }, heroText: { position: 'absolute', bottom: 22, left: 22 }, eyebrow: { color: colors.lime, fontSize: 8, letterSpacing: 1.5, fontWeight: '700' }, title: { color: colors.surface, fontSize: 35, fontWeight: '800', letterSpacing: -1.2, lineHeight: 38, marginTop: 9 }, subtitle: { color: colors.surface, fontSize: 11, marginTop: 10 }, badge: { position: 'absolute', top: 15, right: 15, flexDirection: 'row', alignItems: 'center', gap: 5, padding: 8, borderRadius: 7, backgroundColor: colors.overlay }, badgeText: { color: colors.lime, fontSize: 9, fontWeight: '800' }, filters: { flexDirection: 'row', gap: 10, padding: 20, paddingBottom: 0 }, filter: { flex: 1, height: 77, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: colors.bookSoft }, selected: { backgroundColor: colors.book }, filterText: { color: colors.book, fontSize: 10, fontWeight: '700' }, white: { color: colors.surface }, enquiries: { margin: 20, marginTop: 30, padding: 17, borderRadius: 16, backgroundColor: colors.bookSoft, flexDirection: 'row', alignItems: 'center', gap: 12 }, flex: { flex: 1 }, enquiryTitle: { fontSize: 14, fontWeight: '700', color: colors.book }, enquirySub: { color: colors.muted, fontSize: 10, marginTop: 4 }, notice: { marginHorizontal: 24, fontSize: 10, lineHeight: 16, color: colors.muted } });