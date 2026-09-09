import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from '@react-native-vector-icons/ionicons';
import { colors } from '../theme';
import { useCart } from '../cart';
import { DepartmentStrip } from './department-strip';

export function BrandMark({ large = false }: { large?: boolean }) {
  return <View style={[styles.mark, large && styles.largeMark]}><Text style={[styles.one, large && styles.largeOne]}>1</Text></View>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();
  const reels = path === '/reels';
  const [location, setLocation] = useState('Latur, Maharashtra');
  const [draft, setDraft] = useState(location);
  const [editing, setEditing] = useState(false);
  useEffect(() => { AsyncStorage.getItem('one-latur-location').then(v => { if (v) setLocation(v); }).catch(() => {}); }, []);
  const save = async () => { if (draft.trim().length < 3) return; await AsyncStorage.setItem('one-latur-location', draft.trim()); setLocation(draft.trim()); setEditing(false); };
  return <View style={styles.container}>
    {!reels && <View style={{ paddingTop: insets.top, backgroundColor: colors.surface }}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Pressable testID="location-button" accessibilityRole="button" onPress={() => { setDraft(location); setEditing(true); }} style={styles.location}>
            <Icon name="location" size={18} color={colors.forest} />
            <View style={styles.locationText}><Text style={styles.deliver}>DELIVERING TO</Text><Text testID="selected-location" style={styles.address} numberOfLines={1}>{location}</Text></View>
            <Icon name="chevron-down" size={12} color={colors.onSurface} />
          </Pressable>
          <Pressable testID="header-brand-home" onPress={() => router.navigate('/(tabs)' as any)} style={styles.brand}><BrandMark /><Text testID="company-name" style={styles.wordmark}>One Latur</Text></Pressable>
        </View>
        <View style={styles.searchRow}>
          <Pressable testID="header-search-button" accessibilityLabel="Search products" onPress={() => router.navigate('/search' as any)} style={styles.search}>
            <Icon name="search-outline" size={19} color={colors.onSurface} /><Text style={styles.placeholder}>Search for anything</Text>
          </Pressable>
          <Pressable accessibilityLabel="Cart" testID="header-cart-button" onPress={() => router.navigate('/cart' as any)} style={styles.iconButton}><Icon name="bag-handle-outline" size={22} color={colors.onSurface} />{totalItems > 0 && <View testID="header-cart-count" style={styles.badge}><Text style={styles.badgeText}>{totalItems}</Text></View>}</Pressable>
          <Pressable accessibilityLabel="Profile" testID="header-profile-btn" onPress={() => router.navigate('/account' as any)} style={styles.iconButton}><Icon name="person-outline" size={21} color={colors.onSurface} /></Pressable>
        </View>
      </View>
      <DepartmentStrip />
    </View>}
    <SafeAreaInsetsContext.Provider value={reels ? insets : { ...insets, top: 0 }}><View style={styles.body}>{children}</View></SafeAreaInsetsContext.Provider>
    <Modal visible={editing} transparent animationType="slide" onRequestClose={() => setEditing(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modal}>
        <View testID="location-modal" style={styles.sheet}>
          <View style={styles.topRow}><Text style={styles.modalTitle}>Where should we deliver?</Text><Pressable testID="close-location" style={styles.iconButton} onPress={() => setEditing(false)}><Icon name="close" size={24} color={colors.onSurface} /></Pressable></View>
          <Text style={styles.help}>Enter your area in Latur. This is a sample delivery address.</Text>
          <TextInput testID="location-input" value={draft} onChangeText={setDraft} placeholder="Area, Latur" style={styles.input} maxLength={100} />
          <Pressable testID="save-location" disabled={draft.trim().length < 3} style={[styles.save, draft.trim().length < 3 && styles.disabled]} onPress={save}><Text style={styles.saveText}>Save location</Text></Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface }, body: { flex: 1 }, header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 3 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  location: { flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 }, locationText: { flexShrink: 1 },
  deliver: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1.3 }, address: { color: colors.onSurface, fontSize: 11, fontWeight: '700', marginTop: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 44 }, wordmark: { color: colors.onSurface, fontSize: 20, fontWeight: '800', letterSpacing: -1 },
  mark: { width: 27, height: 27, borderRadius: 20, backgroundColor: colors.brandPrimary, alignItems: 'center', justifyContent: 'center' }, one: { fontSize: 24, lineHeight: 28, fontWeight: '900', color: colors.lime },
  largeMark: { width: 58, height: 58, borderRadius: 29 }, largeOne: { fontSize: 51, lineHeight: 58 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9 }, search: { flex: 1, minHeight: 46, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.border, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }, placeholder: { color: colors.muted, fontSize: 12 },
  iconButton: { height: 44, width: 44, borderRadius: 15, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' }, badge: { position: 'absolute', right: -1, top: -2, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }, badgeText: { fontSize: 10, fontWeight: '800', color: colors.onSurface },
  modal: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }, sheet: { backgroundColor: colors.surface, padding: 24, paddingBottom: 40, borderTopLeftRadius: 24, borderTopRightRadius: 24 }, modalTitle: { fontSize: 20, fontWeight: '700', color: colors.onSurface, flex: 1 }, help: { fontSize: 13, color: colors.muted, marginVertical: 14, lineHeight: 20 }, input: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 12, padding: 14, color: colors.onSurface }, save: { backgroundColor: colors.lime, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 16 }, saveText: { color: colors.onSurface, fontWeight: '700' }, disabled: { opacity: 0.4 },
});