import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { usePathname, useRouter } from 'expo-router';
import { colors } from '../theme';
import { departments } from '../departments';
export function DepartmentStrip() {
  const path = usePathname(); const router = useRouter();
  return <View testID="department-strip" style={styles.row}>{departments.map(d => {
    const selected = path === d.route || (d.id === 'care' && ['/beauty', '/pharmacy'].includes(path));
    return <Pressable testID={`department-${d.id}`} accessibilityRole="button" accessibilityLabel={d.label.replace('\n', ' ')} accessibilityState={{ selected }} key={d.id} onPress={() => router.navigate(d.route as any)} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      <View style={[styles.circle, selected && styles.selected]}><Icon name={d.icon as any} size={20} color={selected ? d.color : colors.onSurface} /></View><Text style={[styles.label, selected && { color: d.color }]}>{d.label}</Text>
    </Pressable>;
  })}</View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 9 }, item: { flex: 1, alignItems: 'center', minHeight: 74, gap: 6 }, circle: { width: 44, height: 44, borderRadius: 18, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassLine, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] }, selected: { backgroundColor: colors.glassBright, boxShadow: [{ offsetX: 0, offsetY: 5, blurRadius: 10, color: colors.shadow }] }, label: { color: colors.onSurface, fontSize: 9, lineHeight: 12, fontWeight: '600', textAlign: 'center' }, pressed: { opacity: 0.6 } });