import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { usePathname, useRouter } from 'expo-router';
import { colors } from '../theme';
import { departments } from '../departments';

export function DepartmentStrip() {
  const pathname = usePathname();
  const router = useRouter();
  return <View testID="department-strip" style={styles.row}>
    {departments.map(d => {
      const active = pathname === d.route;
      return <Pressable key={d.id} accessibilityRole="button" accessibilityLabel={d.label} accessibilityState={{ selected: active }} testID={`department-${d.id}`} onPress={() => router.navigate(d.route as any)} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
        <View style={[styles.circle, { backgroundColor: active ? d.color : d.soft }]}><Icon name={d.icon as any} size={24} color={active ? colors.surface : d.color} /></View>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.label, active && { color: d.color }]}>{d.label}</Text>
        <View style={[styles.line, { backgroundColor: active ? d.color : colors.transparent }]} />
      </Pressable>;
    })}
  </View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 10, paddingTop: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border },
  item: { flex: 1, alignItems: 'center', gap: 7, minHeight: 83 },
  circle: { width: 47, height: 47, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10, fontWeight: '600', color: colors.onSurface, letterSpacing: -0.2 },
  line: { height: 3, width: 28, borderRadius: 2, marginTop: 1 },
  pressed: { opacity: 0.65 },
});