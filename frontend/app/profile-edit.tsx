import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useCustomer } from '@/src/customer';
import { colors } from '@/src/theme';
import { AccountLayout, ActionButton, Message, accountStyles as s } from '@/src/components/account-layout';
export default function ProfileEdit() {
  const { profile, update, ready } = useCustomer(); const [draft, setDraft] = useState(profile); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  useEffect(() => { if (ready) setDraft(profile); }, [ready, profile]);
  const save = async () => {
    setMessage(''); setError('');
    if (draft.name.trim().length < 2) return setError('Please enter a name with at least two characters.');
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) return setError('Please enter a valid email address.');
    if (draft.phone && !/^[6-9]\d{9}$/.test(draft.phone.trim())) return setError('Please enter a valid 10-digit Indian mobile number.');
    setBusy(true); try { await update({ profile: { ...draft, name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone.trim() } }); setMessage('Your profile has been saved on this device.'); } catch { setError('Could not save your profile. Please try again.'); } finally { setBusy(false); }
  };
  return <AccountLayout id="profile-edit" title="Make it yours" subtitle="Your details, your little corner of OneCity. Saved on this device — no sign-in required.">
    <View style={styles.avatars}>{['person', 'happy', 'flower', 'rocket'].map(icon => <Pressable key={icon} testID={`profile-avatar-${icon}`} accessibilityLabel={`Choose ${icon} avatar`} accessibilityState={{ selected: draft.avatar === icon }} style={[styles.avatar, draft.avatar === icon && styles.selected]} onPress={() => setDraft({ ...draft, avatar: icon })}><Icon name={`${icon}-outline` as any} color={colors.shops} size={28} /></Pressable>)}</View>
    <View style={s.card}>{[{ key: 'name', label: 'Full name', placeholder: 'What should we call you?' }, { key: 'email', label: 'Email address · optional', placeholder: 'you@example.com' }, { key: 'phone', label: 'Mobile number · optional', placeholder: '10-digit mobile number' }].map(f => <View key={f.key}><Text testID={`profile-${f.key}-label`} style={s.label}>{f.label}</Text><TextInput testID={`profile-${f.key}-input`} accessibilityLabel={f.label} value={draft[f.key as 'name' | 'email' | 'phone']} onChangeText={value => setDraft({ ...draft, [f.key]: value })} editable={ready && !busy} autoCapitalize={f.key === 'name' ? 'words' : 'none'} keyboardType={f.key === 'email' ? 'email-address' : f.key === 'phone' ? 'phone-pad' : 'default'} maxLength={f.key === 'phone' ? 10 : 100} placeholder={f.placeholder} placeholderTextColor={colors.muted} style={s.input} /></View>)}</View>
    <Message id="profile-edit-error" text={error} error /><Message id="profile-edit-success" text={message} /><ActionButton id="profile-save" title="Save changes" onPress={save} busy={busy} disabled={!ready} />
  </AccountLayout>;
}
const styles = StyleSheet.create({ avatars: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 25 }, avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.transparent }, selected: { borderColor: colors.shops, backgroundColor: colors.shopsMid } });