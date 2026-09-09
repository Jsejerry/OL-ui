import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from '@react-native-vector-icons/ionicons';
import { colors } from '@/src/theme';
import { apiPost } from '@/src/api';
import { useCatalog } from '@/src/use-catalog';
import { LoadState } from '@/src/components/catalog-sections';
import { SavedEnquiry, saveEnquiry } from '@/src/bookings';

function dateString(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export default function Booking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isError, refetch } = useCatalog();
  const event = data?.events.find(e => e.id === id);
  const router = useRouter();
  const [date, setDate] = useState(dateString(new Date()));
  const [slot, setSlot] = useState('');
  const [guests, setGuests] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState('');
  const dates = Array.from({ length: 7 }, (_, index) => { const d = new Date(); d.setDate(d.getDate() + index); return { value: dateString(d), label: index === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' }), day: d.getDate() }; });
  const submit = async () => {
    if (!event || busy) return;
    if (!slot) { setError('Please choose a show time.'); return; }
    if (name.trim().length < 2) { setError('Please enter your name.'); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setError('Enter a valid 10-digit Indian mobile number.'); return; }
    setBusy(true); setError('');
    try {
      const result = await apiPost<SavedEnquiry>('/booking-enquiries', { event_id: id, date, slot, guests, name: name.trim(), phone });
      await saveEnquiry({ ...result, title: event.title }).catch(() => {});
      setSaved(result.id);
    } catch { setError('Couldn’t save your enquiry. Please try again.'); } finally { setBusy(false); }
  };
  if (!data) return <LoadState error={isError} retry={refetch} />;
  if (!event) return <View style={styles.empty}><Text style={styles.title}>Experience not found</Text><Pressable testID="booking-not-found-back" onPress={() => router.replace('/book-it' as any)} style={styles.submit}><Text style={styles.submitText}>Explore Book It</Text></Pressable></View>;
  if (saved) return <View testID="booking-confirmation" style={styles.empty}><View style={styles.successIcon}><Icon name="checkmark" size={35} color={colors.book} /></View><Text style={styles.title}>Your plan is saved.</Text><Text testID="booking-confirmation-detail" style={styles.confirmText}>{event.title}{'\n'}{date} · {slot} · {guests} guest{guests > 1 ? 's' : ''}</Text><Text testID="booking-reference" style={styles.reference}>Reference: {saved.slice(0, 8).toUpperCase()}</Text><Text style={styles.notice}>This is a demo enquiry, not a confirmed ticket. No payment was taken and no venue was contacted.</Text><Pressable testID="booking-view-enquiries" style={styles.submit} onPress={() => router.replace('/enquiries' as any)}><Text style={styles.submitText}>View my enquiries</Text></Pressable><Pressable testID="booking-back-explore" style={styles.backExplore} onPress={() => router.replace('/book-it' as any)}><Text style={styles.backText}>Keep exploring</Text></Pressable></View>;
  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView testID="booking-screen" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <View style={styles.top}><Pressable testID="booking-back" style={styles.iconButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/book-it' as any)}><Icon name="arrow-back" size={23} color={colors.onSurface} /></Pressable><Text style={styles.topTitle}>Plan something good</Text><Text style={styles.demo}>DEMO</Text></View>
    <Image source={event.image} style={styles.image} contentFit="cover" /><Text testID="booking-event-title" style={styles.title}>{event.title}</Text><Text style={styles.sub}>{event.subtitle}</Text><View style={styles.venue}><Icon name="location-outline" size={15} color={colors.book} /><Text style={styles.sub}>{event.venue}</Text></View>
    <Text style={styles.label}>Pick a day</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choices}>{dates.map(d => <Pressable testID={`booking-date-${d.value}`} key={d.value} style={[styles.day, date === d.value && styles.selected]} onPress={() => setDate(d.value)}><Text style={[styles.dayLabel, date === d.value && styles.white]}>{d.label}</Text><Text style={[styles.dayNumber, date === d.value && styles.white]}>{d.day}</Text></Pressable>)}</ScrollView>
    <Text style={styles.label}>Choose a time</Text><View style={styles.times}>{event.slots.map((time, index) => <Pressable testID={`booking-time-${index}`} key={time} style={[styles.time, slot === time && styles.selected]} onPress={() => setSlot(time)}><Text style={[styles.timeText, slot === time && styles.white]}>{time}</Text></Pressable>)}</View>
    <View style={styles.guestRow}><Text style={styles.label}>How many guests?</Text><View style={styles.stepper}><Pressable testID="booking-guests-decrease" disabled={guests <= 1} onPress={() => setGuests(guests - 1)} style={styles.iconButton}><Icon name="remove" size={21} color={guests <= 1 ? colors.muted : colors.book} /></Pressable><Text testID="booking-guests" style={styles.guestCount}>{guests}</Text><Pressable testID="booking-guests-increase" disabled={guests >= 8} onPress={() => setGuests(guests + 1)} style={styles.iconButton}><Icon name="add" size={21} color={colors.book} /></Pressable></View></View>
    <Text style={styles.label}>Your details</Text><TextInput testID="booking-name" style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.muted} maxLength={80} autoComplete="name" /><TextInput testID="booking-phone" style={styles.input} value={phone} onChangeText={v => setPhone(v.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile number" placeholderTextColor={colors.muted} keyboardType="phone-pad" autoComplete="tel" maxLength={10} />
    <View style={styles.estimate}><Text style={styles.sub}>Indicative total · {guests} guest{guests > 1 ? 's' : ''}</Text><Text testID="booking-estimate" style={styles.estimatePrice}>₹{event.price * guests}</Text></View><Text style={styles.notice}>Sample listing. Save an enquiry to try the experience. No real tickets, payment or venue contact.</Text>
    {!!error && <Text testID="booking-error" style={styles.error}>{error}</Text>}<Pressable testID="booking-submit" disabled={busy} onPress={submit} style={[styles.submit, busy && styles.disabled]}>{busy ? <ActivityIndicator color={colors.surface} /> : <><Text style={styles.submitText}>Save demo enquiry</Text><Icon name="arrow-forward" size={19} color={colors.surface} /></>}</Pressable>
  </ScrollView></KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface }, content: { padding: 20, paddingBottom: 40 }, top: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  topTitle: { flex: 1, color: colors.onSurface, fontSize: 17, fontWeight: '700' }, demo: { color: colors.book, fontSize: 9, fontWeight: '800', backgroundColor: colors.bookSoft, padding: 7, borderRadius: 5 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, image: { width: '100%', height: 160, borderRadius: 20, marginBottom: 20 },
  title: { fontSize: 27, fontWeight: '700', color: colors.onSurface, letterSpacing: -0.8 }, sub: { fontSize: 12, color: colors.muted, marginTop: 5 }, venue: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  label: { fontSize: 15, fontWeight: '700', color: colors.onSurface, marginTop: 26, marginBottom: 13 }, choices: { gap: 8 }, day: { minWidth: 57, height: 70, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.bookSoft, gap: 5 },
  dayLabel: { fontSize: 10, color: colors.book }, dayNumber: { fontSize: 21, fontWeight: '700', color: colors.book }, selected: { backgroundColor: colors.book }, white: { color: colors.surface },
  times: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' }, time: { minHeight: 44, paddingHorizontal: 15, borderRadius: 12, backgroundColor: colors.bookSoft, justifyContent: 'center' }, timeText: { color: colors.book, fontSize: 12, fontWeight: '600' },
  guestRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }, stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bookSoft, borderRadius: 12, marginTop: 18 }, guestCount: { fontSize: 17, fontWeight: '700', color: colors.book },
  input: { minHeight: 50, paddingHorizontal: 15, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, marginBottom: 12, color: colors.onSurface, fontSize: 14 }, estimate: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingVertical: 16, borderTopWidth: 1, borderColor: colors.border }, estimatePrice: { color: colors.book, fontSize: 22, fontWeight: '700' },
  notice: { fontSize: 11, lineHeight: 18, color: colors.muted, marginVertical: 12 }, submit: { minHeight: 52, backgroundColor: colors.book, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, marginTop: 12, width: '100%' }, submitText: { color: colors.surface, fontSize: 14, fontWeight: '700' }, error: { color: colors.onError, fontSize: 12, lineHeight: 20 }, disabled: { opacity: 0.6 },
  empty: { flex: 1, padding: 28, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }, successIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.bookSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  confirmText: { fontSize: 14, lineHeight: 23, color: colors.onSurface, textAlign: 'center', marginTop: 16 }, reference: { fontSize: 11, color: colors.book, marginTop: 14 }, backExplore: { minHeight: 44, marginTop: 12, justifyContent: 'center' }, backText: { color: colors.book, fontWeight: '600' },
});