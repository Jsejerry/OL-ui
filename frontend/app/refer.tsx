import { useState } from 'react';
import { View, Text, Share, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Icon from '@react-native-vector-icons/ionicons';
import { useCustomer } from '@/src/customer';
import { AccountLayout, ActionButton, Message, accountStyles as s } from '@/src/components/account-layout';
import { colors } from '@/src/theme';
export default function Refer() {
  const { referral, ready } = useCustomer(); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const copy = async () => { try { await Clipboard.setStringAsync(referral); setMessage('Invite code copied. Share it with a friend!'); setError(''); } catch { setError('Could not copy. You can select and copy the code below.'); } };
  const share = async () => { try { const result = await Share.share({ message: `Discover little local favourites with OneCity, made for Latur. My invite code is ${referral}. Referral rewards are not active yet.` }); if (result.action === Share.sharedAction) setMessage('Invite ready to share.'); setError(''); } catch { setError('Sharing is unavailable here. Use Copy code instead.'); } };
  return <AccountLayout id="refer" title="Good finds. Better together." subtitle="Invite your favourite people to your favourite little city.">
    <View style={st.hero}><View style={st.gift}><Icon name="gift-outline" size={62} color={colors.shops} /></View><Text testID="referral-hero-title" style={st.title}>{'One for you.\nOne for your people.'}</Text><Text style={s.hint}>Your personal invite code</Text><Text testID="referral-code" selectable style={st.code}>{referral || 'Loading…'}</Text></View>
    <ActionButton id="referral-share" title="Share an invite" onPress={share} disabled={!ready || !referral} /><ActionButton id="referral-copy" title="Copy code" onPress={copy} disabled={!ready || !referral} />
    <Message id="referral-success" text={message} /><Message id="referral-error" text={error} error />
    <View style={s.card}><Text testID="referral-status" style={s.title}>Rewards are coming later</Text><Text testID="referral-terms" style={s.hint}>You can share your invite code now. Referral tracking, rewards and cash payouts are not active. No earnings are promised or credited for sharing. This code is stored on this device.</Text></View>
  </AccountLayout>;
}
const st = StyleSheet.create({ hero: { alignItems: 'center', paddingVertical: 20, gap: 15 }, gift: { height: 120, width: 120, borderRadius: 45, backgroundColor: colors.shopsTop, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-7deg' }] }, title: { color: colors.shops, fontSize: 27, fontWeight: '700', textAlign: 'center', lineHeight: 35, marginVertical: 10 }, code: { fontSize: 26, letterSpacing: 3, color: colors.onSurface, fontWeight: '800', padding: 18, backgroundColor: colors.surface, borderRadius: 20 } });