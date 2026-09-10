import { useEffect, useRef } from 'react';
import { View, Text, Animated, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Icon from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useCart } from '../cart';
import { colors } from '../theme';
import { nativeDriver, useMotionAllowed } from '../motion';

export function FloatingCart({ bottom }: { bottom: number }) {
  const { items, totalItems, totalPrice, totalMrp, lastAdded } = useCart();
  const router = useRouter(); const motion = useMotionAllowed(); const { height, width } = useWindowDimensions();
  const entrance = useRef(new Animated.Value(0)).current; const bump = useRef(new Animated.Value(1)).current; const flight = useRef(new Animated.Value(1)).current;
  useEffect(() => { if (!motion) { entrance.setValue(totalItems ? 1 : 0); return; } const animation = Animated.spring(entrance, { toValue: totalItems ? 1 : 0, friction: 8, useNativeDriver: nativeDriver }); animation.start(); return () => animation.stop(); }, [entrance, totalItems, motion]);
  useEffect(() => {
    if (!lastAdded || !motion) return;
    flight.setValue(0); bump.setValue(1);
    const animation = Animated.parallel([Animated.timing(flight, { toValue: 1, duration: 650, useNativeDriver: nativeDriver }), Animated.sequence([Animated.delay(400), Animated.spring(bump, { toValue: 1.035, friction: 4, useNativeDriver: nativeDriver }), Animated.spring(bump, { toValue: 1, friction: 5, useNativeDriver: nativeDriver })])]);
    animation.start(); return () => animation.stop();
  }, [lastAdded, motion, flight, bump]);
  if (!totalItems) return null;
  const start = lastAdded?.origin || { x: width * 0.65, y: height - bottom - 170 };
  const endY = height - bottom - 45;
  return <>
    {motion && lastAdded && <Animated.View testID="cart-flying-product" style={[styles.flying, { opacity: flight.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateX: flight.interpolate({ inputRange: [0, 1], outputRange: [start.x - 22, 26] }) }, { translateY: flight.interpolate({ inputRange: [0, 0.35, 1], outputRange: [start.y - 22, Math.min(start.y - 95, endY - 100), endY] }) }, { scale: flight.interpolate({ inputRange: [0, 1], outputRange: [1.15, 0.5] }) }] }]}><Image source={lastAdded.product.image} style={styles.flyingImage} /></Animated.View>}
    <Animated.View testID="floating-cart" style={[styles.position, { bottom, opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [110, 0] }) }, { scale: bump }] }]}>
      <View style={styles.savings}><Icon name={totalPrice >= 199 ? 'checkmark-circle' : 'bicycle-outline'} color={colors.forest} size={12} /><Text testID="floating-cart-savings" style={styles.savingsText}>{totalPrice >= 199 ? `Free delivery unlocked · Saving ₹${Math.max(0, totalMrp - totalPrice)}` : `₹${199 - totalPrice} away from free delivery`}</Text><View style={styles.progressTrack}><View style={[styles.progress, { width: `${Math.min(100, totalPrice / 199 * 100)}%` }]} /></View></View>
      <Pressable testID="floating-cart-open" accessibilityLabel={`View cart, ${totalItems} items, ₹${totalPrice}`} onPress={() => router.navigate('/cart' as any)} style={({ pressed }) => [styles.bar, pressed && styles.pressed]}>
        <View style={styles.thumbnails}>{items.slice(-2).map((item, i) => <Image key={item.id} source={item.image} style={[styles.thumb, { marginLeft: i ? -20 : 0, transform: [{ rotate: i ? '8deg' : '-8deg' }] }]} />)}</View>
        <View style={styles.flex}><Text testID="floating-cart-count" style={styles.count}>{totalItems} item{totalItems === 1 ? '' : 's'} in your bag</Text><Text testID="floating-cart-price" style={styles.price}>₹{totalPrice}<Text style={styles.fee}> + fees at checkout</Text></Text></View>
        <Text style={styles.cta}>View cart</Text><View style={styles.arrow}><Icon name="arrow-forward" size={18} color={colors.onSurface} /></View>
      </Pressable>
    </Animated.View>
  </>;
}
const styles = StyleSheet.create({ position: { position: 'absolute', left: 14, right: 14, zIndex: 40, borderRadius: 26, backgroundColor: colors.limeSoft, boxShadow: [{ offsetX: 0, offsetY: 6, blurRadius: 22, color: colors.overlay }] }, savings: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, height: 27 }, savingsText: { fontSize: 9, color: colors.forest, fontWeight: '600', flex: 1 }, progressTrack: { width: 30, height: 3, borderRadius: 2, backgroundColor: colors.cityMid, overflow: 'hidden' }, progress: { height: 3, backgroundColor: colors.forest }, bar: { backgroundColor: colors.forestDeep, borderRadius: 24, padding: 10, minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 9 }, thumbnails: { flexDirection: 'row' }, thumb: { width: 36, height: 38, borderRadius: 12, borderWidth: 2, borderColor: colors.surface, backgroundColor: colors.surface }, flex: { flex: 1 }, count: { color: colors.surface, fontSize: 11, fontWeight: '700' }, price: { color: colors.lime, fontSize: 12, fontWeight: '700', marginTop: 4 }, fee: { color: colors.onSurfaceInverse, fontSize: 7, fontWeight: '400' }, cta: { fontSize: 11, fontWeight: '600', color: colors.surface }, arrow: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lime }, flying: { position: 'absolute', left: 0, top: 0, zIndex: 60, width: 44, height: 44, pointerEvents: 'none' }, flyingImage: { width: 44, height: 44, borderRadius: 16, borderWidth: 2, borderColor: colors.lime }, pressed: { opacity: 0.8 } });