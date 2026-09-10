import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AccessibilityInfo, Animated, AppState, Platform, ScrollView, ScrollViewProps, StyleSheet } from 'react-native';

export const nativeDriver = Platform.OS !== 'web';
export function useMotionAllowed() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let reduced = true; let active = AppState.currentState === 'active'; let alive = true;
    const update = () => { if (alive) setAllowed(!reduced && active); };
    AccessibilityInfo.isReduceMotionEnabled().then(v => { reduced = v; update(); });
    const accessibility = AccessibilityInfo.addEventListener('reduceMotionChanged', v => { reduced = v; update(); });
    const app = AppState.addEventListener('change', v => { active = v === 'active'; update(); });
    return () => { alive = false; accessibility.remove(); app.remove(); };
  }, []);
  return allowed;
}
type ScrollContextValue = { y: Animated.Value; headerHeight: number; setHeaderHeight: (v: number) => void; scrollRef: React.RefObject<ScrollView | null> };
const ScrollContext = createContext<ScrollContextValue | null>(null);
export function CityMotionProvider({ children }: { children: React.ReactNode }) {
  const y = useRef(new Animated.Value(0)).current;
  const [headerHeight, setHeaderHeight] = useState(236);
  const scrollRef = useRef<ScrollView>(null);
  return <ScrollContext.Provider value={{ y, headerHeight, setHeaderHeight, scrollRef }}>{children}</ScrollContext.Provider>;
}
export const useCityScroll = () => useContext(ScrollContext)!;
export function CityScroll({ contentContainerStyle, ...props }: ScrollViewProps) {
  const { y, headerHeight, scrollRef } = useCityScroll();
  const ownRef = useRef<ScrollView>(null); const offset = useRef(0);
  useFocusEffect(useCallback(() => { scrollRef.current = ownRef.current; y.setValue(offset.current); }, [scrollRef, y]));
  return <ScrollView {...props} ref={ownRef} scrollEventThrottle={16} onScroll={e => { offset.current = Math.max(0, e.nativeEvent.contentOffset.y); scrollRef.current = ownRef.current; y.setValue(offset.current); }} contentContainerStyle={[styles.content, contentContainerStyle, { paddingTop: headerHeight, paddingBottom: 125 }]} />;
}
const styles = StyleSheet.create({ content: { flexGrow: 1 } });