import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { createWhatsAppPairing, getWhatsAppStatus, unlinkWhatsApp, type WhatsAppPairing, type WhatsAppStatus } from '../services/whatsappService';
import { colors } from '../theme';
import { getWhatsAppErrorMessage } from '../services/whatsappService';

export function WhatsAppScreen() {
  const { session } = useAuth();
  const token = session?.source === 'api' ? session.token : null;
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [number, setNumber] = useState('');
  const [pairing, setPairing] = useState<WhatsAppPairing | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);

  useEffect(() => {
    if (!pairing) return;
    const timer = setTimeout(() => setPairing(null), pairing.expiraEmSegundos * 1000);
    return () => clearTimeout(timer);
  }, [pairing]);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    generation.current += 1;
    setPairing(null); setStatus(null); setError(''); setNumber(''); setConfirmingRemove(false);
    if (!token) { setBusy(false); return () => { generation.current += 1; controller.abort(); }; }
    setBusy(true);
    getWhatsAppStatus(token, controller.signal)
      .then(value => { if (!controller.signal.aborted) setStatus(value); })
      .catch((cause: unknown) => { if (!controller.signal.aborted) setError(getWhatsAppErrorMessage(cause)); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => { generation.current += 1; controller.abort(); };
  }, [token, revision]));

  const create = async () => {
    if (!token || busy) return;
    const requestGeneration = generation.current;
    setBusy(true); setError(''); setPairing(null);
    try { const result = await createWhatsAppPairing(token, number.trim()); if (generation.current === requestGeneration) setPairing(result); }
    catch (cause) { if (generation.current === requestGeneration) setError(getWhatsAppErrorMessage(cause)); }
    finally { if (generation.current === requestGeneration) setBusy(false); }
  };
  const remove = async () => {
    if (!token || busy) return;
    const requestGeneration = generation.current;
    setBusy(true); setError('');
    try { await unlinkWhatsApp(token); if (generation.current === requestGeneration) setRevision(value => value + 1); }
    catch (cause) { if (generation.current === requestGeneration) setError(getWhatsAppErrorMessage(cause)); }
    finally { if (generation.current === requestGeneration) setBusy(false); }
  };
  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>WhatsApp</Text>
      <Text style={styles.copy}>Vincule seu número para enviar receitas e despesas. Confirme cada lançamento na conversa antes de salvar.</Text>
      {!token ? <Text style={styles.copy}>Entre com uma conta real para usar esta opção.</Text> : <>
        {busy && <ActivityIndicator accessibilityLabel="Aguarde" color={colors.primary} />}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {status && <Text style={styles.copy}>{status.vinculado ? `Vinculado: ${status.numeroMascarado ?? 'número confirmado'}` : 'Nenhum número vinculado.'}</Text>}
        {status?.vinculado ? confirmingRemove ? <>
          <Text style={styles.copy}>Desvincular este número? Suas movimentações não serão apagadas.</Text>
          <Button label="Confirmar desvinculação" disabled={busy} onPress={() => void remove()} />
          <Button label="Cancelar" disabled={busy} onPress={() => setConfirmingRemove(false)} />
        </> : <Button label="Desvincular" disabled={busy} onPress={() => setConfirmingRemove(true)} /> : status && <>
          <Text style={styles.label}>Seu número com DDI e DDD</Text>
          <TextInput accessibilityLabel="Seu número com DDI e DDD" keyboardType="phone-pad" value={number} onChangeText={setNumber} placeholder="Ex.: 5562999999999" maxLength={15} style={styles.input} />
          <Button label="Gerar código de vínculo" disabled={busy} onPress={() => void create()} />
          {pairing && <View style={styles.instructions}>
            <Text style={styles.copy}>Envie a mensagem abaixo pelo WhatsApp informado para o número do projeto. O código vale por {Math.floor(pairing.expiraEmSegundos / 60)} minutos e deve ser mantido em sigilo.</Text>
            <Text selectable style={styles.code}>{pairing.comando}</Text>
            <Button label="Já enviei — atualizar status" disabled={busy} onPress={() => setRevision(value => value + 1)} />
          </View>}
        </>}
        {!status && !busy && <Button label="Tentar novamente" onPress={() => setRevision(value => value + 1)} />}
      </>}
    </View>
  </ScrollView>;
}

function Button({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.button, disabled && { opacity: 0.5 }]}><Text style={styles.buttonText}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, backgroundColor: colors.background, padding: 20 },
  card: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 20, gap: 16, backgroundColor: colors.surface, borderRadius: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text }, copy: { fontSize: 16, lineHeight: 24, color: colors.text },
  label: { fontSize: 16, fontWeight: '600', color: colors.text }, input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, color: colors.text },
  button: { minHeight: 48, justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: colors.primary },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 }, error: { color: '#B42318', fontSize: 16 },
  instructions: { gap: 12 }, code: { color: colors.text, fontSize: 16, fontWeight: '600' },
});
