import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {AVATAR_BODY, getItem} from '../data/shopItems';

/**
 * Capas superpuestas con position:'absolute':
 *  Capa 1: cuerpo base de Avy
 *  Capa 2: sombrero
 *  Capa 3: lentes
 */
export default function AvatarView({size = 220, hatId, glassesId, style}) {
  const hat = hatId ? getItem(hatId) : null;
  const glasses = glassesId ? getItem(glassesId) : null;
  const layer = {width: size, height: size};

  return (
    <View style={[{width: size, height: size}, style]}>
      <Image source={AVATAR_BODY} style={[styles.layer, layer]} resizeMode="contain" />
      {hat && <Image source={hat.image} style={[styles.layer, layer]} resizeMode="contain" />}
      {glasses && <Image source={glasses.image} style={[styles.layer, layer]} resizeMode="contain" />}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {position: 'absolute', top: 0, left: 0},
});
