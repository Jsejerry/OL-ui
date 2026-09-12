import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { colors } from '../theme';
import { nativeDriver, useMotionAllowed } from '../motion';
function Rangoli() {
  return <Svg width={210} height={210} viewBox="0 0 200 200"><G>{Array.from({ length: 12 }, (_, i) => <G key={i} transform={`rotate(${i * 30} 100 100)`}><Ellipse cx="100" cy="48" rx="12" ry="33" fill="none" stroke={colors.gold} strokeWidth="1.5" /><Circle cx="100" cy="13" r="3" fill={colors.gold} /></G>)}<Circle cx="100" cy="100" r="25" stroke={colors.gold} strokeWidth="2" fill="none" /><Circle cx="100" cy="100" r="13" stroke={colors.gold} fill="none" /></G></Svg>;
}
export function StoreAtmosphere({ id, festival }: { id: string; festival: string }) {
  const progress = useRef(new Animated.Value(0)).current; const motion = useMotionAllowed();
  useEffect(() => {
    if (!motion) { progress.setValue(0.4); return; }
    const animation = Animated.loop(Animated.sequence([Animated.timing(progress, { toValue: 1, duration: id === 'fitness' ? 1800 : 4600, useNativeDriver: nativeDriver }), Animated.timing(progress, { toValue: 0, duration: id === 'fitness' ? 1800 : 4600, useNativeDriver: nativeDriver })]));
    animation.start(); return () => animation.stop();
  }, [id, motion, progress]);
  const symbol = id === 'fitness' ? 'barbell-outline' : id === 'trending' ? 'sparkles-outline' : id === 'gourmet' ? 'cafe-outline' : 'leaf-outline';
  return <View testID={`store-animation-${id}`} style={[styles.layer, { pointerEvents: 'none' }]}>
    {id === 'festive' ? <><View style={styles.toran}><Svg width="100%" height={40} viewBox="0 0 360 40"><Path d="M0 1 Q45 55 90 1 Q135 55 180 1 Q225 55 270 1 Q315 55 360 1" stroke={colors.gold} strokeWidth="2" fill="none" />{Array.from({ length: 9 }, (_, i) => <Circle key={i} cx={i*45} cy={12} r={5} fill={colors.gold} />)}</Svg></View><Animated.View style={[styles.rangoli, { transform: [{ rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '12deg'] }) }] }]}><Rangoli /></Animated.View><Animated.View style={[styles.festivalSymbol, { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }), transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] }) }] }]}>{festival === 'navratri' ? <View style={styles.sticks}><View style={[styles.stick, { transform: [{ rotate: '38deg' }] }]} /><View style={[styles.stick, { transform: [{ rotate: '-38deg' }] }]} /></View> : <Icon name="flame" size={29} color={colors.gold} />}</Animated.View></> : <>{[0, 1, 2].map(i => <Animated.View key={i} style={[styles.float, { left: `${12+i*34}%`, top: 30+i*63, opacity: id === 'fitness' ? 0.18 : 0.15, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, -15-i*3] }) }, { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '16deg'] }) }] }]}><Icon name={symbol} size={i === 1 ? 70 : 34} color={colors.lime} /></Animated.View>)}{id === 'fitness' && <Animated.View style={[styles.ring, { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.02] }), transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1.45] }) }] }]} />}</>}
  </View>;
}
const styles = StyleSheet.create({ layer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' }, toran: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0.7 }, rangoli: { position: 'absolute', right: -45, top: 52, opacity: 0.26 }, festivalSymbol: { position: 'absolute', left: 25, bottom: 19 }, float: { position: 'absolute' }, ring: { position: 'absolute', width: 250, height: 250, borderWidth: 2, borderColor: colors.lime, borderRadius: 125, right: -30, top: 20 }, sticks: { width: 25, height: 30 }, stick: { position: 'absolute', width: 4, height: 35, backgroundColor: colors.gold, borderRadius: 2, left: 12 } });