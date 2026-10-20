import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, AppState, StyleSheet, Platform, ScrollView} from 'react-native';
import BackgroundTips from '../components/BackgroundTips';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/CustomButton';
import BlockerNative from '../modules/BlockerNativeModule';
import {colors, radius} from '../theme';

function PermissionCard({icon, title, desc, granted, onPress}) {
  return (
    <View style={styles.card}>
      <Icon name={icon} size={32} color={granted ? colors.success : colors.accent} />
      <View style={{flex: 1, marginHorizontal: 12}}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
      {granted ? (
        <Icon name="check-circle" size={28} color={colors.success} />
      ) : (
        <CustomButton title="Activar" onPress={onPress} style={{paddingVertical: 8, paddingHorizontal: 14}} />
      )}
    </View>
  );
}

export default function PermissionsScreen({navigation}) {
  const [accessibility, setAccessibility] = useState(false);
  const [overlay, setOverlay] = useState(false);

  const refresh = useCallback(async () => {
    setAccessibility(await BlockerNative.isAccessibilityEnabled());
    setOverlay(await BlockerNative.isOverlayEnabled());
  }, []);

  useEffect(() => {
    refresh();
    // Al volver desde Ajustes del sistema, refrescamos el estado
    const sub = AppState.addEventListener('change', s => s === 'active' && refresh());
    return () => sub.remove();
  }, [refresh]);

  const done = () => navigation.reset({index: 0, routes: [{name: 'Main'}]});

  return (
  <SafeAreaView style={styles.container}>
    <Text style={styles.header}>Permisos para el bloqueo</Text>
    <Text style={styles.sub}>
      NeurOn necesita dos permisos de Android para detectar las apps de distracción y mostrar la pantalla de bloqueo.
    </Text>
    {Platform.OS !== 'android' && <Text style={styles.warn}>El bloqueo solo funciona en Android.</Text>}

    <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 16}}
        showsVerticalScrollIndicator={false}>
      <PermissionCard
        icon="eye-outline"
        title="Servicio de accesibilidad"
        desc="Detecta qué app está en primer plano. No leemos tu contenido."
        granted={accessibility}
        onPress={BlockerNative.openAccessibilitySettings}
      />
      <PermissionCard
        icon="layers-outline"
        title="Mostrar sobre otras apps"
        desc="Dibuja la pantalla de bloqueo encima de las apps."
        granted={overlay}
        onPress={BlockerNative.openOverlaySettings}
      />

      {Platform.OS === 'android' && <BackgroundTips />}
    </ScrollView>

    <CustomButton
      title={accessibility && overlay ? 'Continuar' : 'Omitir por ahora'}
      variant={accessibility && overlay ? 'accent' : 'ghost'}
      onPress={done}
    />
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg, padding: 20},
  header: {color: colors.text, fontSize: 26, fontWeight: '800', marginTop: 12},
  sub: {color: colors.muted, fontSize: 14, marginVertical: 12},
  warn: {color: colors.danger, marginBottom: 8},
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md,
    padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  title: {color: colors.text, fontWeight: '700', fontSize: 15},
  desc: {color: colors.muted, fontSize: 12, marginTop: 2},
});
