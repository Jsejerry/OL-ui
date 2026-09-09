import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, AppState, Share, Modal, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { colors } from '../theme';
import { BACKEND, Reel } from '../api';
import { useCart } from '../cart';

function ReelVideo({ source, muted, paused, id }: { source: string; muted: boolean; paused: boolean; id: string }) {
  const [failed, setFailed] = useState(false);
  const player = useVideoPlayer(source, p => { p.loop = true; p.muted = true; p.play(); });
  useEffect(() => { player.muted = muted; }, [player, muted]);
  useEffect(() => { if (paused) player.pause(); else player.play(); }, [player, paused]);
  useEffect(() => {
    const listener = player.addListener('statusChange', e => setFailed(e.status === 'error'));
    const app = AppState.addEventListener('change', state => { if (state !== 'active' || paused) player.pause(); else player.play(); });
    return () => { listener.remove(); app.remove(); };
  }, [player, paused]);
  return <><View testID={`reel-video-${id}`} style={styles.video}><VideoView player={player} nativeControls={false} contentFit="cover" style={styles.video} /></View>{failed && <View style={styles.videoError}><Text testID={`reel-video-error-${id}`} style={styles.errorText}>Video unavailable. You can still shop this find.</Text></View>}</>;
}

export function ReelCard({ reel: r, height, active, next }: { reel: Reel; height: number; active: boolean; next: () => void }) {
  const { add, qtyOf, totalItems } = useCart();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const link = `${BACKEND}/product/${r.product.id}`;
  useEffect(() => { AsyncStorage.getItem(`reel-like-${r.id}`).then(value => { setLiked(value === 'yes'); setHydrated(true); }).catch(() => setHydrated(true)); }, [r.id]);
  const like = async () => { const previous = liked; setLiked(!previous); try { await AsyncStorage.setItem(`reel-like-${r.id}`, !previous ? 'yes' : 'no'); } catch { setLiked(previous); setMessage('Could not save your like. Please try again.'); } };
  const share = async () => { if (Platform.OS === 'web') { setCopied(false); setShareOpen(true); return; } try { await Share.share({ title: r.product.name, message: `Found on One Latur: ${r.product.name} — ${link}` }); } catch { setShareOpen(true); } };
  return <View testID={`reel-card-${r.id}`} style={[styles.card, { height }]}>
    <Image source={r.product.image} contentFit="cover" style={StyleSheet.absoluteFill} />
    {active && <ReelVideo source={Platform.OS === 'web' ? r.video_web : r.video} muted={muted} paused={paused || shareOpen} id={r.id} />}
    <LinearGradient colors={[colors.overlay, colors.transparent, colors.transparent, colors.overlayDeep]} locations={[0, 0.25, 0.5, 1]} style={StyleSheet.absoluteFill} />
    <View style={[styles.top, { paddingTop: insets.top + 16 }]}><View><Text style={styles.title}>One finds.</Text><Text style={styles.topSub}>WATCH IT. LOVE IT. SHOP IT.</Text></View><Pressable testID={`reel-cart-${r.id}`} accessibilityLabel="View cart" onPress={() => router.navigate('/cart' as any)} style={styles.round}><Icon name="bag-handle-outline" size={23} color={colors.surface} />{totalItems > 0 && <Text testID={`reel-cart-count-${r.id}`} style={styles.cartCount}>{totalItems}</Text>}</Pressable></View>
    <Pressable testID={`reel-play-${r.id}`} accessibilityLabel={paused ? 'Play video' : 'Pause video'} onPress={() => setPaused(!paused)} style={styles.playArea}>{paused && <View style={styles.pauseIcon}><Icon name="play" size={34} color={colors.surface} /></View>}</Pressable>
    <View style={styles.actions}>
      <Pressable testID={`reel-like-${r.id}`} accessibilityLabel={liked ? 'Unlike product' : 'Like product'} accessibilityState={{ selected: liked }} disabled={!hydrated} onPress={like} style={styles.action}><Icon name={liked ? 'heart' : 'heart-outline'} size={29} color={liked ? colors.lime : colors.surface} /><Text testID={`reel-likes-${r.id}`} style={styles.actionLabel}>{r.likes + (liked ? 1 : 0)}</Text></Pressable>
      <Pressable testID={`reel-share-${r.id}`} accessibilityLabel="Share product" onPress={share} style={styles.action}><Icon name="paper-plane-outline" size={27} color={colors.surface} /><Text style={styles.actionLabel}>Share</Text></Pressable>
      <Pressable testID={`reel-mute-${r.id}`} accessibilityLabel={muted ? 'Unmute video' : 'Mute video'} onPress={() => setMuted(!muted)} style={styles.action}><Icon name={muted ? 'volume-mute-outline' : 'volume-high-outline'} size={26} color={colors.surface} /><Text style={styles.actionLabel}>{muted ? 'Sound off' : 'Sound on'}</Text></Pressable>
    </View>
    <View style={styles.bottom}>
      <View style={styles.creator}><View style={styles.avatar}><Icon name="storefront-outline" size={18} color={colors.onSurface} /></View><View><Text style={styles.creatorName}>{r.creator}</Text><Text style={styles.sample}>Sample product film</Text></View><Icon name="checkmark-circle" size={16} color={colors.lime} /></View>
      <Text testID={`reel-caption-${r.id}`} style={styles.caption}>{r.caption}</Text>
      <View style={styles.product}><Pressable testID={`reel-product-${r.id}`} onPress={() => router.push(`/product/${r.product.id}` as any)} style={styles.productInfo}><Image source={r.product.image} style={styles.productImage} /><View style={styles.flex}><Text style={styles.productName} numberOfLines={1}>{r.product.name}</Text><Text testID={`reel-price-${r.id}`} style={styles.price}>₹{r.product.price} <Text style={styles.mrp}>₹{r.product.mrp}</Text></Text></View></Pressable><Pressable testID={`reel-add-${r.id}`} accessibilityLabel={`Add ${r.product.name} to cart`} onPress={() => add(r.product)} style={styles.add}><Icon name={qtyOf(r.product.id) > 0 ? 'checkmark' : 'add'} size={17} color={colors.onSurface} /><Text testID={`reel-added-${r.id}`} style={styles.addText}>{qtyOf(r.product.id) > 0 ? `Added · ${qtyOf(r.product.id)}` : 'Add to cart'}</Text></Pressable></View>
      {!!message && <Text testID={`reel-feedback-${r.id}`} style={styles.errorText}>{message}</Text>}
      <Pressable testID={`reel-next-${r.id}`} onPress={next} style={styles.next}><Icon name="chevron-up" size={13} color={colors.surface} /><Text style={styles.nextText}>Swipe up for your next find</Text></Pressable>
    </View>
    <Modal visible={shareOpen} transparent animationType="slide" onRequestClose={() => setShareOpen(false)}><View style={styles.modal}><View testID={`reel-share-sheet-${r.id}`} style={styles.sheet}><View style={styles.sheetTop}><Text style={styles.sheetTitle}>Share a good find</Text><Pressable testID={`reel-share-close-${r.id}`} style={styles.round} onPress={() => setShareOpen(false)}><Icon name="close" size={23} color={colors.onSurface} /></Pressable></View><Text style={styles.shareName}>{r.product.name}</Text><Text selectable testID={`reel-share-link-${r.id}`} style={styles.link}>{link}</Text><Pressable testID={`reel-copy-link-${r.id}`} style={styles.copy} onPress={async () => { try { await Clipboard.setStringAsync(link); setCopied(true); } catch { setMessage('Select the link to copy it manually.'); } }}><Icon name={copied ? 'checkmark' : 'copy-outline'} size={18} color={colors.onSurface} /><Text testID={`reel-copy-status-${r.id}`} style={styles.addText}>{copied ? 'Link copied' : 'Copy product link'}</Text></Pressable></View></View></Modal>
  </View>;
}
const styles = StyleSheet.create({
  video: { ...StyleSheet.absoluteFill, width: '100%', height: '100%', pointerEvents: 'none' },
  card: { backgroundColor: colors.brandPrimary, width: '100%', overflow: 'hidden' }, top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { color: colors.surface, fontSize: 29, fontWeight: '800', letterSpacing: -1 }, topSub: { fontSize: 7, letterSpacing: 1.7, color: colors.surface, marginTop: 5 }, round: { width: 44, height: 44, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.whiteGlass }, cartCount: { position: 'absolute', right: -2, top: -2, paddingHorizontal: 5, borderRadius: 8, backgroundColor: colors.lime, color: colors.onSurface, fontSize: 10, fontWeight: '800' }, playArea: { position: 'absolute', top: '18%', bottom: '40%', left: 0, right: 70, alignItems: 'center', justifyContent: 'center' }, pauseIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center' }, actions: { position: 'absolute', right: 14, bottom: 240, gap: 23 }, action: { width: 50, minHeight: 50, alignItems: 'center', gap: 5 }, actionLabel: { color: colors.surface, fontSize: 10, fontWeight: '600' }, bottom: { position: 'absolute', bottom: 10, left: 18, right: 18 }, creator: { flexDirection: 'row', alignItems: 'center', gap: 8 }, avatar: { backgroundColor: colors.lime, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, creatorName: { color: colors.surface, fontSize: 13, fontWeight: '700' }, sample: { fontSize: 8, color: colors.surface, marginTop: 3 }, caption: { color: colors.surface, fontSize: 12, lineHeight: 18, marginTop: 13, marginBottom: 16, maxWidth: 290 }, product: { backgroundColor: colors.surface, padding: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }, productInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }, productImage: { width: 43, height: 48, borderRadius: 9 }, flex: { flex: 1 }, productName: { color: colors.onSurface, fontSize: 11, fontWeight: '700' }, price: { color: colors.forest, fontSize: 14, fontWeight: '800', marginTop: 7 }, mrp: { fontWeight: '400', fontSize: 10, color: colors.muted, textDecorationLine: 'line-through' }, add: { backgroundColor: colors.lime, minHeight: 44, paddingHorizontal: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 3 }, addText: { color: colors.onSurface, fontSize: 10, fontWeight: '800' }, next: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }, nextText: { color: colors.surface, fontSize: 8, letterSpacing: 0.6 }, videoError: { position: 'absolute', top: '40%', alignSelf: 'center', padding: 12, backgroundColor: colors.overlay }, errorText: { color: colors.surface, fontSize: 12 }, modal: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }, sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 38 }, sheetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sheetTitle: { fontSize: 23, fontWeight: '700', color: colors.onSurface }, shareName: { fontSize: 14, color: colors.onSurface, marginTop: 12 }, link: { color: colors.muted, backgroundColor: colors.cream, padding: 14, borderRadius: 10, marginVertical: 14, fontSize: 11 }, copy: { minHeight: 48, backgroundColor: colors.lime, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
});