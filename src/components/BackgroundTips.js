import React from 'react';
import {View, Text, Pressable, Linking, StyleSheet} from 'react-native';
import BlockerNative from '../modules/BlockerNativeModule';
import {colors, radius} from '../theme';

const TIPS = [
  'Ahorro de batería: ponlo en "Sin restricciones" para que no se apague solo.',
  'Inicio automático: actívalo para NeurOn si tu marca lo incluye.',
  'Fija NeurOn en la lista de apps recientes (ícono de candado).',
  'Ventanas emergentes en segundo plano: actívalo en "Otros permisos".',
];

export default function BackgroundTips() {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Mantener bloqueo activo en segundo plano</Text>
      <Text style={styles.text}>
        Muchos dispositivos (Xiaomi, Samsung, Motorola, etc.) apagan los servicios en segundo plano para ahorrar batería tras un tiempo de uso:
      </Text>
      {TIPS.map(t => (
        <Text key={t} style={styles.tip}>• {t}</Text>
      ))}

      <Pressable style={styles.btn} onPress={() => BlockerNative.requestIgnoreBatteryOptimization()}>
        <Text style={styles.btnText}>Desactivar ahorro de batería para NeurOn</Text>
      </Pressable>

      <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => Linking.openSettings()}>
        <Text style={[styles.btnText, styles.btnSecondaryText]}>Abrir ajustes de la app</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.card,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 16,
    marginTop: 16,
  },
  title: {color: colors.text, fontWeight: '800', fontSize: 15, marginBottom: 6},
  text: {color: colors.muted, fontSize: 13, marginBottom: 8},
  tip: {color: colors.text, fontSize: 13, marginBottom: 4},
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
  },
  btnText: {color: '#FFFFFF', fontWeight: '700'},
  btnSecondaryText: {color: colors.text},
});
