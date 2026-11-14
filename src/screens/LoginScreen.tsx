import { useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { MockCredentialsError } from '../services/authService';
import { ApiError } from '../services/httpClient';
import { colors } from '../theme';
import { RegisterScreen } from './RegisterScreen';

function loginErrorMessage(error: unknown): string {
  if (error instanceof MockCredentialsError) return error.message;
  if (error instanceof ApiError) {
    if (error.kind === 'configuration') return 'O endereço da API não está configurado corretamente.';
    if (error.kind === 'connection') return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    if (error.kind === 'timeout') return 'O servidor demorou muito para responder. Tente novamente.';
    if (error.status === 401 || error.status === 403) return 'E-mail ou senha inválidos.';
    if (error.status === 404) return 'A rota de login não foi encontrada. Verifique a URL e a configuração da API.';
    if (error.status !== undefined && error.status >= 500) {
      return 'O servidor não conseguiu processar o login. Tente novamente mais tarde.';
    }
    if (error.kind === 'http') return 'A solicitação de login foi rejeitada pelo servidor.';
    if (error.kind === 'invalid_response') return 'O servidor respondeu em um formato inesperado.';
  }
  return 'Não foi possível entrar. Tente novamente.';
}

function FinanceMark() {
  return (
    <LinearGradient
      accessible={false}
      colors={['#168BFA', '#0750C7']}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.financeMark}
    >
      <View style={styles.chartBars}>
        <View style={[styles.chartBar, styles.chartBarSmall]} />
        <View style={[styles.chartBar, styles.chartBarMedium]} />
        <View style={[styles.chartBar, styles.chartBarLarge]} />
      </View>
      <Text style={styles.chartArrow}>↗</Text>
    </LinearGradient>
  );
}

function EmailIcon() {
  return (
    <View accessible={false} style={styles.emailIcon}>
      <View style={styles.emailFlapLeft} />
      <View style={styles.emailFlapRight} />
    </View>
  );
}

function LockIcon() {
  return (
    <View accessible={false} style={styles.lockIcon}>
      <View style={styles.lockShackle} />
      <View style={styles.lockBody}>
        <View style={styles.lockKeyhole} />
      </View>
    </View>
  );
}

function VisibilityIcon({ visible }: { visible: boolean }) {
  return (
    <View accessible={false} style={styles.eyeIcon}>
      <View style={styles.eyePupil} />
      {!visible ? <View style={styles.eyeSlash} /> : null}
    </View>
  );
}

function EntryIcon() {
  return (
    <View accessible={false} style={styles.entryIcon}>
      <View style={styles.entryDoor} />
      <Text style={styles.entryArrow}>→</Text>
    </View>
  );
}

export function LoginScreen() {
  const { login, error, authMode } = useAuth();
  const insets = useSafeAreaInsets();
  const passwordInputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(null);
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);

  async function handleLogin() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !senha) {
      setValidationError('Informe seu e-mail e senha.');
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);
    try {
      await login(normalizedEmail, senha);
    } catch (error) {
      setValidationError(loginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const contextError = error?.operation === 'login' ? error.message : null;
  const visibleError = validationError ?? contextError;

  if (showRegistration && authMode === 'api') {
    return <RegisterScreen onReturnToLogin={(registeredEmail) => {
      setShowRegistration(false);
      setValidationError(null);
      if (registeredEmail) {
        setEmail(registeredEmail);
        setSenha('');
        setRegistrationNotice('Cadastro concluído. Entre com seu e-mail e senha.');
      }
    }} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F6FAFF', '#EAF3FF']}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      >
        <View pointerEvents="none" style={styles.waveLayer}>
          <View style={[styles.wave, styles.waveBack]} />
          <View style={[styles.wave, styles.waveMiddle]} />
          <View style={[styles.wave, styles.waveFront]} />
        </View>
      </LinearGradient>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingLeft: insets.left + 24,
            paddingRight: insets.right + 24,
          },
        ]}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <FinanceMark />
            <Text accessibilityRole="header" style={styles.title}>Meu Controle{'\n'}Financeiro</Text>
            <Text style={styles.subtitle}>Gerencie suas finanças com facilidade.</Text>
          </View>

          <View style={styles.card}>
            {registrationNotice ? (
              <Text accessibilityRole="alert" style={styles.notice}>{registrationNotice}</Text>
            ) : null}
            {authMode === 'mock' ? (
              <Text accessibilityRole="text" style={styles.demoBadge}>Modo demonstração</Text>
            ) : null}

            <Text accessibilityRole="header" style={styles.formTitle}>Entrar na sua conta</Text>

            <View style={styles.inputRow}>
              <EmailIcon />
              <TextInput
                accessibilityLabel="E-mail"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isSubmitting}
                keyboardType="email-address"
                onChangeText={setEmail}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                placeholder="E-mail"
                placeholderTextColor={colors.muted}
                returnKeyType="next"
                style={styles.input}
                textContentType="username"
                value={email}
              />
            </View>

            <View style={styles.inputRow}>
              <LockIcon />
              <TextInput
                ref={passwordInputRef}
                accessibilityLabel="Senha"
                autoCapitalize="none"
                autoComplete="password"
                editable={!isSubmitting}
                onChangeText={setSenha}
                onSubmitEditing={() => void handleLogin()}
                placeholder="Senha"
                placeholderTextColor={colors.muted}
                returnKeyType="go"
                secureTextEntry={!showPassword}
                style={styles.input}
                textContentType="password"
                value={senha}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                disabled={isSubmitting}
                onPress={() => setShowPassword((visible) => !visible)}
                style={({ pressed }) => [styles.visibilityButton, pressed && styles.pressed]}
              >
                <VisibilityIcon visible={showPassword} />
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => setRecoveryNotice('A recuperação de senha ainda não está disponível no aplicativo.')}
              style={({ pressed }) => [styles.recoveryLink, pressed && styles.pressed]}
            >
              <View accessible={false} style={styles.helpIcon}>
                <Text style={styles.helpMark}>?</Text>
              </View>
              <Text style={styles.linkText}>Esqueci minha senha</Text>
            </Pressable>
            {recoveryNotice ? (
              <Text accessibilityRole="alert" style={styles.notice}>{recoveryNotice}</Text>
            ) : null}

            {visibleError ? (
              <View accessibilityRole="alert" style={styles.errorBox}>
                <Text style={styles.errorText}>{visibleError}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Entrar"
              disabled={isSubmitting}
              onPress={() => void handleLogin()}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                isSubmitting && styles.buttonDisabled,
              ]}
            >
              <LinearGradient
                colors={['#0756C9', '#073B98']}
                end={{ x: 1, y: 0 }}
                start={{ x: 0, y: 0 }}
                style={styles.buttonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <View style={styles.buttonContents}>
                    <EntryIcon />
                    <Text style={styles.buttonText}>Entrar</Text>
                  </View>
                )}
              </LinearGradient>
            </Pressable>

            {authMode === 'api' ? (
              <>
                <View accessible={false} style={styles.separator}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>ou</Text>
                  <View style={styles.separatorLine} />
                </View>
                <View style={styles.registerRow}>
                  <Text style={styles.registerText}>Ainda não tem conta?</Text>
                  <Pressable
                    accessibilityRole="button"
                    disabled={isSubmitting}
                    onPress={() => {
                      setRegistrationNotice(null);
                      setShowRegistration(true);
                    }}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <Text style={styles.linkText}>Cadastre-se</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  waveLayer: { flex: 1, overflow: 'hidden' },
  wave: { position: 'absolute', borderRadius: 999 },
  waveBack: {
    width: '180%',
    height: 128,
    left: '-38%',
    bottom: -78,
    backgroundColor: '#D9E9FF',
    transform: [{ rotate: '-8deg' }],
  },
  waveMiddle: {
    width: '175%',
    height: 104,
    left: '-36%',
    bottom: -56,
    backgroundColor: '#B9D8FF',
    opacity: 0.62,
    transform: [{ rotate: '7deg' }],
  },
  waveFront: {
    width: '170%',
    height: 78,
    left: '-34%',
    bottom: -43,
    backgroundColor: '#8DBDFF',
    opacity: 0.38,
    transform: [{ rotate: '-4deg' }],
  },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  content: { width: '100%', maxWidth: 440, alignSelf: 'center', gap: 22 },
  header: { alignItems: 'center', gap: 8 },
  financeMark: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderRadius: 20,
    paddingBottom: 15,
    marginBottom: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 9,
    elevation: 5,
  },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  chartBar: { width: 10, borderRadius: 2, backgroundColor: colors.surface },
  chartBarSmall: { height: 13 },
  chartBarMedium: { height: 21 },
  chartBarLarge: { height: 29 },
  chartArrow: { position: 'absolute', top: 3, right: 7, color: colors.surface, fontSize: 26, fontWeight: '700' },
  title: {
    maxWidth: 340,
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 33,
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 350,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    gap: 14,
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 5,
  },
  formTitle: {
    marginTop: 2,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'left',
  },
  demoBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: colors.background,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  inputRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    paddingLeft: 16,
  },
  input: { flex: 1, minHeight: 54, color: colors.text, fontSize: 16 },
  emailIcon: {
    width: 22,
    height: 17,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  emailFlapLeft: {
    position: 'absolute',
    top: -5,
    left: 2,
    width: 11,
    height: 11,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  emailFlapRight: {
    position: 'absolute',
    top: -5,
    right: 2,
    width: 11,
    height: 11,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.primary,
    transform: [{ rotate: '45deg' }],
  },
  lockIcon: { width: 22, height: 25, alignItems: 'center', justifyContent: 'flex-end' },
  lockShackle: {
    position: 'absolute',
    top: 0,
    width: 13,
    height: 13,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: colors.primary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  lockBody: {
    width: 21,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  lockKeyhole: { width: 3, height: 5, borderRadius: 2, backgroundColor: colors.primary },
  visibilityButton: { width: 48, minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  eyeIcon: {
    width: 23,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.muted,
    borderRadius: 12,
  },
  eyePupil: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.muted },
  eyeSlash: {
    position: 'absolute',
    width: 26,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.muted,
    transform: [{ rotate: '-45deg' }],
  },
  recoveryLink: { minHeight: 32, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 8 },
  helpIcon: {
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.7,
    borderColor: colors.primary,
    borderRadius: 10,
  },
  helpMark: { color: colors.primary, fontSize: 13, fontWeight: '700', lineHeight: 16 },
  linkText: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  notice: {
    borderRadius: 10,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorBox: { borderRadius: 10, backgroundColor: '#FEE4E2', paddingHorizontal: 12, paddingVertical: 10 },
  errorText: { color: '#B42318', lineHeight: 20 },
  button: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    overflow: 'hidden',
  },
  buttonGradient: {
    width: '100%',
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    paddingHorizontal: 16,
  },
  buttonContents: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  entryIcon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  entryDoor: {
    position: 'absolute',
    right: 2,
    width: 9,
    height: 19,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.surface,
  },
  entryArrow: { color: colors.surface, fontSize: 25, fontWeight: '500', lineHeight: 28, marginLeft: -5 },
  buttonDisabled: { opacity: 0.7 },
  pressed: { opacity: 0.82 },
  buttonText: { color: colors.surface, fontSize: 18, fontWeight: '700' },
  separator: { flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 2 },
  separatorLine: { flex: 1, height: 1, backgroundColor: colors.border },
  separatorText: { color: colors.muted, fontSize: 15 },
  registerRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8 },
  registerText: { color: colors.text, fontSize: 15 },
});
