import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NehurOnSvg from '../components/NehurOnSvg';
import CustomButton from '../components/CustomButton';
import useUserStore from '../store/useUserStore';
import {apiLogin, apiRegister} from '../services/api';
import {colors, radius} from '../theme';

export default function LoginScreen({navigation}) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginSuccess = useUserStore(s => s.loginSuccess);
  const hasOnboarded = useUserStore(s => s.hasOnboarded);

  // Acceso inmediato en Modo Local para probar la app sin depender del servidor
  const enterLocalMode = (customEmail = null, customName = null) => {
    loginSuccess({
      email: customEmail || (email.trim() ? email.trim().toLowerCase() : 'tester@neuron.com'),
      userName: customName || (userName.trim() ? userName.trim() : 'Tester NehurOn'),
      points: 1000,
      streakDays: 1,
      focusHours: 1.0,
      unlockedItems: ['hat_gorra', 'hat_birrete', 'gl_pixel'],
      equippedHat: 'hat_gorra',
      equippedGlasses: 'gl_pixel',
    });
    if (hasOnboarded) {
      navigation.replace('Main');
    } else {
      navigation.replace('Permissions');
    }
  };

  // Acción: Iniciar Sesión
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert(
        'Campos requeridos',
        'Por favor ingresa tu correo y contraseña, o entra directo con el botón "Probar app de inmediato".'
      );
    }

    setLoading(true);
    try {
      const res = await apiLogin(email.trim().toLowerCase(), password);

      if (res.ok && res.data?.user) {
        loginSuccess(res.data.user);
        if (hasOnboarded) {
          navigation.replace('Main');
        } else {
          navigation.replace('Permissions');
        }
      } else {
        Alert.alert(
          'Servidor no disponible',
          'El servidor de base de datos no está accesible en esta red. ¿Deseas entrar en Modo Local para probar la app en tu teléfono?',
          [
            {text: 'Cancelar', style: 'cancel'},
            {text: 'Entrar en Modo Local', onPress: () => enterLocalMode()},
          ]
        );
      }
    } catch (err) {
      Alert.alert(
        'Modo Sin Servidor',
        'La app no pudo conectar con el servidor de la PC. ¿Deseas entrar en Modo Local para probar todas las funciones en tu teléfono?',
        [
          {text: 'Cancelar', style: 'cancel'},
          {text: 'Entrar en Modo Local', onPress: () => enterLocalMode()},
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Acción: Registrar Nueva Cuenta
  const handleRegister = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = userName.trim();

    if (!cleanName || !cleanEmail || !password.trim()) {
      return Alert.alert(
        'Campos requeridos',
        'Por favor completa tu nombre, correo y contraseña.'
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return Alert.alert(
        'Correo inválido',
        'Por favor ingresa una dirección de correo válida (ejemplo: usuario@gmail.com).'
      );
    }

    if (password.length < 6) {
      return Alert.alert(
        'Contraseña corta',
        'La contraseña debe tener al menos 6 caracteres.'
      );
    }

    if (password !== confirmPassword) {
      return Alert.alert(
        'Contraseñas no coinciden',
        'Por favor asegúrate de que ambas contraseñas sean iguales.'
      );
    }

    setLoading(true);
    try {
      const res = await apiRegister(cleanEmail, password, cleanName);

      if (res.ok && res.data?.user) {
        loginSuccess(res.data.user);
        Alert.alert(
          '🎉 ¡Registro Exitoso!',
          `Bienvenido a NehurOn, ${cleanName}. Tu cuenta ha sido guardada con un bono de bienvenida de 100 tokens.`,
          [
            {
              text: 'Comenzar',
              onPress: () => {
                if (hasOnboarded) {
                  navigation.replace('Main');
                } else {
                  navigation.replace('Permissions');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Servidor no disponible',
          'El servidor en la PC no respondió. ¿Deseas entrar en Modo Local con estos datos para probar la app en tu teléfono?',
          [
            {text: 'Cancelar', style: 'cancel'},
            {text: 'Entrar en Modo Local', onPress: () => enterLocalMode(cleanEmail, cleanName)},
          ]
        );
      }
    } catch (err) {
      Alert.alert(
        'Modo Sin Servidor',
        'No se pudo conectar con el servidor. ¿Deseas registrarte y entrar en Modo Local para probar la app?',
        [
          {text: 'Cancelar', style: 'cancel'},
          {text: 'Entrar en Modo Local', onPress: () => enterLocalMode(cleanEmail, cleanName)},
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const fillTesterCredentials = () => {
    setIsRegisterMode(false);
    setEmail('tester@neuron.com');
    setPassword('tester123');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          {/* Logo Central (SVG de la carita del Hurón) */}
          <View style={styles.logoContainer}>
            <View style={styles.avatarGlow}>
              <NehurOnSvg size={130} showBackground={false} />
            </View>

            {/* Texto "NehurOn" renderizado por CÓDIGO */}
            <View style={styles.brandTitleContainer}>
              <Text style={styles.brandNehur}>
                Nehur
                <Text style={styles.brandOn}>On</Text>
              </Text>
            </View>
            <Text style={styles.brandSubtitle}>
              Vence la procrastinación · Recupera tu enfoque
            </Text>
          </View>

          {/* Selector de Modo: Iniciar Sesión / Registrarse */}
          <View style={styles.modeTabs}>
            <Pressable
              style={[styles.modeTab, !isRegisterMode && styles.modeTabActive]}
              onPress={() => setIsRegisterMode(false)}>
              <Text
                style={[
                  styles.modeTabText,
                  !isRegisterMode && styles.modeTabTextActive,
                ]}>
                Iniciar Sesión
              </Text>
            </Pressable>

            <Pressable
              style={[styles.modeTab, isRegisterMode && styles.modeTabActive]}
              onPress={() => setIsRegisterMode(true)}>
              <Text
                style={[
                  styles.modeTabText,
                  isRegisterMode && styles.modeTabTextActive,
                ]}>
                Crear Cuenta
              </Text>
            </Pressable>
          </View>

          {/* Tarjeta de Formulario */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isRegisterMode ? 'Crear Cuenta Nueva' : 'Iniciar Sesión'}
            </Text>
            <Text style={styles.cardDesc}>
              {isRegisterMode
                ? 'Regístrate para guardar tu racha y progreso'
                : 'Ingresa con tu correo o prueba la app directamente'}
            </Text>

            {/* Input Nombre de Usuario (Solo en Registro) */}
            {isRegisterMode && (
              <>
                <Text style={styles.label}>Nombre de Usuario</Text>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="account-outline"
                    size={20}
                    color={colors.muted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Ej. Sofía Morales"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="words"
                  />
                </View>
              </>
            )}

            {/* Input Correo */}
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="email-outline"
                size={20}
                color={colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="ejemplo@gmail.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Input Contraseña */}
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="lock-outline"
                size={20}
                color={colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={8}
                style={styles.eyeBtn}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            </View>

            {/* Confirmar Contraseña (Solo en Registro) */}
            {isRegisterMode && (
              <>
                <Text style={styles.label}>Confirmar Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <Icon
                    name="lock-check-outline"
                    size={20}
                    color={colors.muted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              </>
            )}

            {/* Botón Principal de Acción */}
            <View style={{marginTop: 18}}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.loadingText}>
                    Conectando con la base de datos...
                  </Text>
                </View>
              ) : (
                <CustomButton
                  title={isRegisterMode ? 'Crear mi Cuenta' : 'Entrar a NehurOn'}
                  icon={isRegisterMode ? 'account-plus' : 'login'}
                  variant="accent"
                  onPress={isRegisterMode ? handleRegister : handleLogin}
                />
              )}
            </View>

            {/* Botón Destacado: Probar de inmediato sin servidor */}
            <Pressable
              style={styles.localChip}
              onPress={() => enterLocalMode()}>
              <Icon name="lightning-bolt" size={18} color="#FF7A2F" />
              <Text style={styles.localChipText}>
                ⚡ Probar app de inmediato (Modo Local)
              </Text>
            </Pressable>

            {/* Botón Helper de Tester (Solo en Login) */}
            {!isRegisterMode && (
              <Pressable
                style={styles.testerChip}
                onPress={fillTesterCredentials}>
                <Icon name="shield-check-outline" size={16} color={colors.primary} />
                <Text style={styles.testerChipText}>
                  Usar Tester: tester@neuron.com
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  avatarGlow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandNehur: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 1.5,
  },
  brandOn: {
    color: colors.primary,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  loadingText: {
    color: colors.text,
    fontSize: 13,
    marginLeft: 10,
    fontWeight: '600',
  },
  localChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 122, 47, 0.15)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FF7A2F',
  },
  localChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '800',
    marginLeft: 6,
  },
  testerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(95, 133, 118, 0.12)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(95, 133, 118, 0.3)',
  },
  testerChipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 6,
  },
});
