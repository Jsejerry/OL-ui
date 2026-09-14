import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { PaymentMethod } from '../customer';
import { colors } from '../theme';
export const paymentOptions: { id: PaymentMethod; title: string; subtitle: string; icon: string }[] = [
  { id: 'upi', title: 'UPI', subtitle: 'Google Pay, PhonePe, Paytm & other UPI apps', icon: 'phone-portrait-outline' },
  { id: 'card', title: 'Credit / Debit card', subtitle: 'Visa, Mastercard, RuPay & more', icon: 'card-outline' },
  { id: 'netbanking', title: 'Net banking', subtitle: 'Pay using your preferred bank', icon: 'business-outline' },
  { id: 'cod', title: 'Cash on delivery', subtitle: 'Pay when your order arrives', icon: 'cash-outline' },
];
export const paymentLabel = (id: PaymentMethod) => paymentOptions.find(p => p.id === id)?.title || 'Cash on delivery';
export function PaymentOptions({ value, onChange, scope, disabled }: { value: PaymentMethod; onChange: (id: PaymentMethod) => void; scope: string; disabled?: boolean }) {
  return <View testID={`${scope}-options`} style={s.options}>{paymentOptions.map(p => <Pressable key={p.id} testID={`${scope}-method-${p.id}`} accessibilityRole="radio" accessibilityState={{ checked: value === p.id }} disabled={disabled} onPress={() => onChange(p.id)} style={({ pressed }) => [s.option, value === p.id && s.selected, pressed && s.pressed]}><View style={s.icon}><Icon name={p.icon as any} size={24} color={colors.shops} /></View><View style={s.copy}><Text testID={`${scope}-label-${p.id}`} style={s.title}>{p.title}</Text><Text style={s.sub}>{p.subtitle}</Text></View><Icon name={value === p.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={colors.shops} /></Pressable>)}</View>;
}
const s = StyleSheet.create({ options: { gap: 12 }, option: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border }, selected: { borderColor: colors.shops, backgroundColor: colors.shopsFade }, icon: { width: 40, height: 44, justifyContent: 'center' }, copy: { flex: 1 }, title: { fontSize: 14, fontWeight: '700', color: colors.onSurface }, sub: { fontSize: 11, color: colors.muted, lineHeight: 17, marginTop: 4 }, pressed: { opacity: 0.65 } });