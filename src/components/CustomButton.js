import React from 'react';
import {Pressable, Text, StyleSheet, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors, radius} from '../theme';

const VARIANTS = {
  primary: {bg: colors.primary, fg: colors.text},
  accent: {bg: colors.accent, fg: '#1A1200'},
  danger: {bg: colors.danger, fg: colors.text},
  ghost: {bg: 'transparent', fg: colors.text, border: colors.border},
};

export default function CustomButton({title, onPress, variant = 'primary', icon, disabled, loading, style}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({pressed}) => [
        styles.btn,
        {backgroundColor: v.bg, borderColor: v.border || v.bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1},
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={20} color={v.fg} style={styles.icon} /> : null}
          <Text style={[styles.text, {color: v.fg}]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  icon: {marginRight: 8},
  text: {fontSize: 16, fontWeight: '700', letterSpacing: 0.3},
});
