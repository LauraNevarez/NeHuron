import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import NehurOnSvg from './NehurOnSvg';
import {ACCESSORY_SVGS} from '../assets/mascota/accessories';

/**
 * Componente visual de la mascota NehurOn:
 * Renderiza la base del hurón en SVG y superpone capas vectoriales transparentes
 * para los accesorios desbloqueados o equipados.
 *
 * Como todos los SVGs comparten un viewBox nativo de 1024x1024:
 *  - Capa 1: Base SVG del hurón
 *  - Capa 2: Sombrero / Accesorio de cabeza ('hat')
 *  - Capa 3: Lentes / Accesorio de rostro ('glasses')
 * Se alinean perfectamente con exactitud de pixel sin requerir desfases manuales.
 */
export default function AvatarView({
  size = 220,
  hatId,
  glassesId,
  showBackground = false,
  style,
}) {
  const hatXml = hatId ? ACCESSORY_SVGS[hatId] : null;
  const glassesXml = glassesId ? ACCESSORY_SVGS[glassesId] : null;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      {/* Capa 1: Base Hurón NehurOn SVG */}
      <NehurOnSvg
        size={size}
        showBackground={showBackground}
        style={styles.baseSvg}
      />

      {/* Capa 2: Accesorio de Cabeza / Sombrero */}
      {hatXml && (
        <View pointerEvents="none" style={[styles.layer, styles.hatLayer]}>
          <SvgXml xml={hatXml} width={size} height={size} />
        </View>
      )}

      {/* Capa 3: Accesorio de Rostro / Lentes */}
      {glassesXml && (
        <View pointerEvents="none" style={[styles.layer, styles.glassesLayer]}>
          <SvgXml xml={glassesXml} width={size} height={size} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  baseSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  hatLayer: {
    zIndex: 2,
  },
  glassesLayer: {
    zIndex: 3,
  },
});
