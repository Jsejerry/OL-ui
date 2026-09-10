import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, AppState } from 'react-native';
import { AudioModule, RecordingPresets, useAudioRecorder, useAudioRecorderState, setAudioModeAsync } from 'expo-audio';
import Icon from '@react-native-vector-icons/ionicons';
import { colors } from '../theme';

export function VoiceSearchControl({ onRecording, onError, disabled }: { onRecording: (uri: string, filename: string, type: string) => void; onError: (message: string) => void; disabled: boolean }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const status = useAudioRecorderState(recorder, 200);
  const [preparing, setPreparing] = useState(false);
  const stopping = useRef(false); const alive = useRef(true);
  const stop = useCallback(async (submit = true) => {
    if (stopping.current) return;
    stopping.current = true;
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const uri = recorder.uri;
      if (submit && uri && alive.current) onRecording(uri, Platform.OS === 'web' ? 'speech.webm' : 'speech.m4a', Platform.OS === 'web' ? 'audio/webm' : 'audio/mp4');
    } catch { if (alive.current) onError('Could not finish the recording. Please try again.'); }
    finally { stopping.current = false; }
  }, [onRecording, onError, recorder]);
  useEffect(() => { if (status.isRecording && status.durationMillis >= 19500) void stop(); }, [status.durationMillis, status.isRecording, stop]);
  useEffect(() => { const sub = AppState.addEventListener('change', state => { if (state !== 'active' && recorder.isRecording) void stop(false); }); return () => { sub.remove(); }; }, [recorder, stop]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; if (recorder.isRecording) { void recorder.stop().catch(() => {}); void setAudioModeAsync({ allowsRecording: false }).catch(() => {}); } }; }, [recorder]);
  const start = async () => {
    setPreparing(true);
    try {
      let permission = await AudioModule.getRecordingPermissionsAsync();
      if (!permission.granted) permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) { onError('Microphone access is off. Allow it in device settings, or use text search.'); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch { onError('Microphone could not start. Check permission or use text search.'); }
    finally { setPreparing(false); }
  };
  return <View style={styles.wrap}><Pressable testID="voice-record-button" accessibilityLabel={status.isRecording ? 'Stop and search' : 'Start voice search'} disabled={disabled || preparing} onPress={status.isRecording ? () => void stop() : start} style={[styles.mic, status.isRecording && styles.recording, (disabled || preparing) && styles.disabled]}><Icon name={status.isRecording ? 'stop' : 'mic-outline'} size={32} color={status.isRecording ? colors.surface : colors.forest} /></Pressable><Text testID="voice-record-status" style={styles.status}>{status.isRecording ? `Listening · ${Math.floor(status.durationMillis / 1000)}s / 20s` : preparing ? 'Opening your microphone…' : 'Tap, speak, and find your favourites.'}</Text><Text style={styles.tip}>{status.isRecording ? 'Tap the square when you’ve finished.' : 'Try “Amul cheese and milk” in English, Hindi or Marathi.'}</Text></View>;
}
const styles = StyleSheet.create({ wrap: { alignItems: 'center', paddingVertical: 26 }, mic: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.limeSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 7, borderColor: colors.glassBright }, recording: { backgroundColor: colors.forest }, status: { fontSize: 12, color: colors.onSurface, marginTop: 18, fontWeight: '500' }, tip: { color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 8 }, disabled: { opacity: 0.4 } });