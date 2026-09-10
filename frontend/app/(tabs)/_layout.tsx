import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/ionicons';
import { colors } from '@/src/theme';
import { BrandMark } from '@/src/components/app-shell';

const visible = [
  { name: 'index', label: 'Home', icon: 'home-outline' },
  { name: 'categories', label: 'Categories', icon: 'grid-outline' },
  { name: 'reels', label: 'Discover', icon: 'play-outline' },
  { name: 'food', label: 'Food', icon: 'fast-food-outline' },
  { name: 'book-it', label: 'Book It', icon: 'ticket-outline' },
];
function BottomBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const active = state.routes[state.index].name;
  const dark = active === 'reels';
  return <View testID="bottom-navigation" style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 9) }, dark && styles.dark]}>
    {visible.map(tab => <Pressable key={tab.name} testID={`tab-${tab.name === 'index' ? 'home' : tab.name}`} accessibilityRole="tab" accessibilityLabel={tab.name === 'reels' ? 'Product reels' : tab.label} accessibilityState={{ selected: active === tab.name }} onPress={() => navigation.navigate(tab.name)} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      {tab.name === 'reels' ? <View style={[styles.center, dark && styles.darkCenter]}><BrandMark large /></View> : <Icon name={tab.icon as any} size={19} color={active === tab.name ? colors.forest : dark ? colors.onSurfaceInverse : colors.muted} />}
      <Text style={[styles.label, active === tab.name && styles.active, dark && styles.lightLabel, tab.name === 'reels' && styles.centerLabel]}>{tab.label}</Text>
      {active === tab.name && tab.name !== 'reels' && <View style={styles.dot} />}
    </Pressable>)}
  </View>;
}
export default function TabsLayout() {
  return <Tabs tabBar={props => <BottomBar {...props} />} screenOptions={{ headerShown: false, lazy: true, animation: 'none', sceneStyle: { backgroundColor: colors.surface } }}>
    {visible.map(t => <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />)}
    {['cart', 'account', 'grocery', 'pharmacy', 'beauty', 'shops', 'care'].map(name => <Tabs.Screen key={name} name={name} options={{ href: null }} />)}
  </Tabs>;
}
const styles = StyleSheet.create({
  bar: { flexDirection: 'row', paddingTop: 12, backgroundColor: colors.glassBright, borderWidth: 1, borderColor: colors.glassLine, borderRadius: 29, marginHorizontal: 10, marginBottom: 5, boxShadow: [{ offsetX: 0, offsetY: -3, blurRadius: 20, color: colors.shadow }] },
  item: { flex: 1, minHeight: 45, alignItems: 'center', justifyContent: 'flex-start', gap: 5 }, label: { fontSize: 8, fontWeight: '500', color: colors.muted }, active: { color: colors.forest, fontWeight: '600' },
  center: { marginTop: -31, borderWidth: 6, borderColor: colors.surface, borderRadius: 40, backgroundColor: colors.surface, boxShadow: [{ offsetX: 0, offsetY: 2, blurRadius: 6, color: colors.border }], elevation: 5 }, centerLabel: { marginTop: -3, fontSize: 9, color: colors.onSurface },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.forest, position: 'absolute', bottom: -2 }, pressed: { opacity: 0.6 }, dark: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary }, darkCenter: { borderColor: colors.brandPrimary, backgroundColor: colors.brandPrimary }, lightLabel: { color: colors.onSurfaceInverse },
});