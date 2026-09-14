import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import { useCustomer } from '@/src/customer';
import { colors } from '@/src/theme';
import { PaymentOptions } from '@/src/components/payment-options';
import { AccountLayout, ActionButton, Message, accountStyles as s } from '@/src/components/account-layout';
export default function Payments() {
  const { payment, update, ready } = useCustomer(); const [selected, setSelected] = useState(payment); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  useEffect(() => { setSelected(payment); }, [payment]);
  const save = async () => { setBusy(true); setMessage(''); setError(''); try { await update({ payment: selected }); setMessage('Your preferred payment method is saved for checkout.'); } catch { setError('Could not save your preference.'); } finally { setBusy(false); } };
  return <AccountLayout id="payments" title="Your way to pay" subtitle="Choose a preferred method for your next sample order."><PaymentOptions scope="preferences" value={selected} onChange={setSelected} disabled={!ready || busy} /><ActionButton id="payment-save" title="Save payment preference" onPress={save} busy={busy} disabled={!ready} /><Message id="payment-success" text={message} /><Message id="payment-error" text={error} error /><View style={s.card}><Icon name="shield-checkmark-outline" size={26} color={colors.shops} /><Text testID="payment-sample-notice" style={s.hint}>Payment-method selection only. This app does not charge you or collect card numbers, CVV, bank logins or UPI PINs. The demo wallet is not spendable at checkout.</Text></View></AccountLayout>;
}