import React, {useCallback, useState} from 'react';
import {View, Text, TextInput, Switch, ScrollView, Alert, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import useUserStore from '../store/useUserStore';
import useActivityStore from '../store/useActivityStore';
import BlockerNative from '../modules/BlockerNativeModule';
import {DEFAULT_BLOCKED_APPS} from '../data/shopItems';
import {colors, radius} from '../theme';

export default function SettingsScreen({navigation}) {
  const userName = useUserStore(s => s.userName);
  const setUserName = useUserStore(s => s.setUserName);
  const blockedApps = useUserStore(s => s.blockedApps);
  const toggleBlockedApp = useUserStore(s => s.toggleBlockedApp);
  const resetAll = useUserStore(s => s.resetAll);
  const clearActivities = useActivityStore(s => s.clearActivities);
  const [perms, setPerms] = useState({a: false, o: false});

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
        <TextInput style={styles.input} value={userName} onChangeText={setUserName} placeholderTextColor={colors.muted} />

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
                onValueChange={() => toggleBlockedApp(app.pkg)}
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
  input: {backgroundColor: colors.card, color: colors.text, borderRadius: radius.md, padding: 14, fontSize: 16, borderWidth: 1, borderColor: colors.border},
  card: {backgroundColor: colors.card, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border},
  appRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6},
  appName: {color: colors.text, fontSize: 15},
});
