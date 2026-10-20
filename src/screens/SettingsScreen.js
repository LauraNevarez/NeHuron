import React, {useCallback, useState} from 'react';
import {View, Text, TextInput, Switch, ScrollView, Alert, Pressable, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import AvatarView from '../components/AvatarView';
import useUserStore from '../store/useUserStore';
import useActivityStore from '../store/useActivityStore';
import BlockerNative from '../modules/BlockerNativeModule';
import {DEFAULT_BLOCKED_APPS} from '../data/shopItems';
import {colors, radius} from '../theme';

export default function SettingsScreen({navigation}) {
  const userName = useUserStore(s => s.userName);
  const setUserName = useUserStore(s => s.setUserName);
  const equippedHat = useUserStore(s => s.equippedHat);
  const equippedGlasses = useUserStore(s => s.equippedGlasses);
  const blockedApps = useUserStore(s => s.blockedApps);
  const toggleBlockedApp = useUserStore(s => s.toggleBlockedApp);
  const resetAll = useUserStore(s => s.resetAll);
  const clearActivities = useActivityStore(s => s.clearActivities);
  const [perms, setPerms] = useState({a: false, o: false});

  const handleToggleApp = pkg => {
    toggleBlockedApp(pkg);
    const {isEssentialModeActive, blockedApps: updated} = useUserStore.getState();
    if (isEssentialModeActive) {
      BlockerNative.setBlockedPackages(updated);
    }
  };

  useFocusEffect(
    useCallback(() => {
      (async () => setPerms({a: await BlockerNative.isAccessibilityEnabled(), o: await BlockerNative.isOverlayEnabled()}))();
    }, []),
  );

  const reset = () =>
    Alert.alert('Borrar todo', 'Se eliminarán puntos, accesorios y actividades.', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Borrar', style: 'destructive',
        onPress: async () => {
          await BlockerNative.stopBlocking();
          resetAll();
          clearActivities();
          navigation.reset({index: 0, routes: [{name: 'Onboarding'}]});
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{padding: 16}}>
        <Text style={styles.title}>Ajustes</Text>

        <Text style={styles.section}>Perfil</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <AvatarView size={95} hatId={equippedHat} glassesId={equippedGlasses} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileLabel}>Nombre de usuario</Text>
            <TextInput
              style={styles.nameInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Tu nombre"
              placeholderTextColor={colors.muted}
            />
            <Pressable
              style={styles.closetLink}
              onPress={() => navigation.navigate('Armario')}
              hitSlop={8}>
              <Icon name="hanger" size={16} color={colors.primary} />
              <Text style={styles.closetLinkText}>Personalizar en el Armario</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.section}>Permisos</Text>
        <View style={styles.card}>
          <PermRow label="Servicio de accesibilidad" ok={perms.a} />
          <PermRow label="Mostrar sobre otras apps" ok={perms.o} />
          <CustomButton title="Configurar permisos" variant="ghost" onPress={() => navigation.navigate('Permissions')} style={{marginTop: 10}} />
        </View>

        <Text style={styles.section}>Apps a bloquear en Modo Esencial</Text>
        <View style={styles.card}>
          {DEFAULT_BLOCKED_APPS.map(app => (
            <View key={app.pkg} style={styles.appRow}>
              <Text style={styles.appName}>{app.name}</Text>
              <Switch
                value={blockedApps.includes(app.pkg)}
                onValueChange={() => handleToggleApp(app.pkg)}
                trackColor={{true: colors.primary, false: colors.border}}
                thumbColor={colors.text}
              />
            </View>
          ))}
        </View>

        <CustomButton title="Borrar todos los datos" icon="delete-outline" variant="danger" onPress={reset} style={{marginTop: 24}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PermRow = ({label, ok}) => (
  <View style={styles.appRow}>
    <Text style={styles.appName}>{label}</Text>
    <Icon name={ok ? 'check-circle' : 'close-circle'} size={22} color={ok ? colors.success : colors.danger} />
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  title: {color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 8},
  section: {color: colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 20, marginBottom: 10},
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarWrapper: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  nameInput: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  closetLinkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  card: {backgroundColor: colors.card, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border},
  appRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6},
  appName: {color: colors.text, fontSize: 15},
});
