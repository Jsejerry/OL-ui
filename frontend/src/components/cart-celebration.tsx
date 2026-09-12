import { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Icon from '@react-native-vector-icons/ionicons';
import { useRouter } from 'expo-router';
import { useCart } from '../cart';
import { colors } from '../theme';
import { nativeDriver, useMotionAllowed } from '../motion';

export function CartCelebration({ top }: { top: number }) {
  const { lastAdded, totalItems } = useCart(); const router = useRouter(); const motion = useMotionAllowed();
  const progress = useRef(new Animated.Value(0)).current; const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!lastAdded) return;
    setVisible(true); progress.setValue(motion ? 0 : 1);
    const animation = Animated.spring(progress, { toValue: 1, friction: 6, useNativeDriver: nativeDriver });
    animation.start();
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => { clearTimeout(timer); animation.stop(); };
  }, [lastAdded, motion, progress]);
  if (!visible || !lastAdded) return null;
  return <Animated.View testID="cart-added-popup" accessibilityLiveRegion="polite" style={[styles.toast, { top, opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-70, 0] }) }, { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
    <Image testID="cart-added-image" source={lastAdded.product.image} contentFit="contain" style={styles.image} /><View style={styles.copy}><Text testID="cart-added-title" style={styles.title}>A little joy, added!</Text><Text testID="cart-added-product" numberOfLines={1} style={styles.name}>{lastAdded.product.name}</Text></View><Pressable testID="cart-added-open" accessibilityLabel={`View cart with ${totalItems} items`} style={styles.action} onPress={() => { setVisible(false); router.navigate('/cart'); }}><Icon name="checkmark-circle" size={19} color={colors.lime} /><Text style={styles.actionText}>View bag</Text></Pressable>
  </Animated.View>;
}
const styles = StyleSheet.create({ toast: { position: 'absolute', left: 14, right: 14, zIndex: 100, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 22, backgroundColor: colors.forestDeep, padding: 10, boxShadow: [{ offsetX: 0, offsetY: 5, blurRadius: 20, color: colors.shadow }] }, image: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surface }, copy: { flex: 1 }, title: { color: colors.surface, fontSize: 13, fontWeight: '700' }, name: { color: colors.cityMid, fontSize: 10, marginTop: 4 }, action: { minHeight: 44, minWidth: 64, alignItems: 'center', justifyContent: 'center', gap: 3 }, actionText: { color: colors.surface, fontSize: 10, fontWeight: '600' } });