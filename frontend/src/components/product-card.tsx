import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import Icon from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme';
import { useCart } from '@/src/cart';
import type { Product } from '@/src/api';
import { nativeDriver, useMotionAllowed } from '../motion';

export function ProductCard({ product: p, width = 158, scope = '' }: { product: Product; width?: number | null; scope?: string }) {
  const router = useRouter();
  const { add, remove, qtyOf } = useCart();
  const qty = qtyOf(p.id);
  const id = scope ? `${scope}-${p.id}` : p.id;
  const bounce = useRef(new Animated.Value(1)).current; const motion = useMotionAllowed();
  useEffect(() => { if (!qty || !motion) return; const animation = Animated.sequence([Animated.timing(bounce, { toValue: 0.96, duration: 100, useNativeDriver: nativeDriver }), Animated.spring(bounce, { toValue: 1, friction: 3, useNativeDriver: nativeDriver })]); animation.start(); return () => animation.stop(); }, [qty, motion, bounce]);
  return <Animated.View style={[styles.card, width ? { width } : styles.fill, { transform: [{ scale: bounce }] }]} testID={`product-card-${id}`}>
    <Pressable accessibilityLabel={`View ${p.name}`} testID={`product-open-${id}`} onPress={() => router.push(`/product/${p.id}` as any)} style={({ pressed }) => pressed && styles.pressed}>
      <View style={styles.imageWrap}><Image testID={`product-image-${id}`} source={p.image} style={styles.image} contentFit="cover" transition={180} />
        {!!p.discount_pct && <View style={styles.discount}><Text testID={`product-discount-${id}`} style={styles.discountText}>{p.discount_pct}% OFF</Text></View>}
        <View style={styles.rating}><Icon name="star" size={10} color={colors.forest} /><Text style={styles.ratingText}>{p.rating}</Text></View>
      </View>
      <View style={styles.content}><Text testID={`product-name-${id}`} numberOfLines={2} style={styles.name}>{p.name}</Text><Text testID={`product-weight-${id}`} numberOfLines={1} style={styles.weight}>{p.weight}</Text></View>
    </Pressable>
    <View style={styles.footer}>
      <View style={styles.priceWrap}><Text testID={`product-price-${id}`} style={styles.price}>₹{p.price}</Text>{p.mrp > p.price && <Text style={styles.mrp}>₹{p.mrp}</Text>}</View>
      {!qty ? <Pressable testID={`add-btn-${id}`} accessibilityLabel={`Add ${p.name}`} onPress={e => add(p, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })} style={({ pressed }) => [styles.add, pressed && styles.pressed]}><Text style={styles.addText}>ADD</Text><Icon name="add" size={14} color={colors.forest} /></Pressable> : <View testID={`stepper-${id}`} style={styles.stepper}><Pressable testID={`dec-${id}`} accessibilityLabel={`Remove one ${p.name}`} onPress={() => remove(p.id)} style={styles.step}><Icon name="remove" size={15} color={colors.forest} /></Pressable><Text testID={`qty-${id}`} style={styles.qty}>{qty}</Text><Pressable testID={`inc-${id}`} accessibilityLabel={`Add one ${p.name}`} onPress={e => add(p, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })} style={styles.step}><Icon name="add" size={15} color={colors.forest} /></Pressable></View>}
    </View>
  </Animated.View>;
}
const styles = StyleSheet.create({
  card: { borderRadius: 23, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' }, fill: { width: '100%' },
  imageWrap: { height: 130, backgroundColor: colors.cream }, image: { width: '100%', height: '100%' }, discount: { position: 'absolute', left: 8, top: 8, backgroundColor: colors.surface, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 4 }, discountText: { fontSize: 8, fontWeight: '800', color: colors.forest }, rating: { position: 'absolute', right: 7, bottom: 7, flexDirection: 'row', alignItems: 'center', gap: 3, padding: 4, backgroundColor: colors.surface, borderRadius: 5 }, ratingText: { fontSize: 9, fontWeight: '700', color: colors.onSurface },
  content: { paddingHorizontal: 10, paddingTop: 10 }, name: { fontSize: 12, lineHeight: 17, fontWeight: '700', color: colors.onSurface, height: 34 }, weight: { fontSize: 10, color: colors.muted, marginTop: 2 }, footer: { flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingRight: 6, paddingVertical: 6, gap: 2 }, priceWrap: { flex: 1 }, price: { fontSize: 14, fontWeight: '800', color: colors.forest }, mrp: { fontSize: 9, color: colors.muted, textDecorationLine: 'line-through' },
  add: { minHeight: 44, minWidth: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.limeSoft, borderRadius: 23 }, addText: { fontSize: 11, color: colors.forest, fontWeight: '800' }, stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.limeSoft, borderRadius: 23 }, step: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, qty: { fontSize: 11, fontWeight: '700', color: colors.forest }, pressed: { opacity: 0.65, transform: [{ scale: 0.97 }] },
});