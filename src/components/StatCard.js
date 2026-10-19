import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius} from '../theme';

export default function StatCard({icon, label, value, color = colors.primary, style}) {
  return (
    <View style={[styles.card, style]}>
      <Icon name={icon} size={26} color={color} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: {color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 6},
  label: {color: colors.muted, fontSize: 12, marginTop: 2, textAlign: 'center'},
});
