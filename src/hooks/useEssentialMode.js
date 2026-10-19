import {useCallback} from 'react';
import {Alert} from 'react-native';
import useUserStore from '../store/useUserStore';
import BlockerNative from '../modules/BlockerNativeModule';

export default function useEssentialMode(navigation) {
  const isActive = useUserStore(s => s.isEssentialModeActive);

  const start = useCallback(async () => {
    const ok = await BlockerNative.hasAllPermissions();
    if (!ok) {
      Alert.alert(
        'Permisos necesarios',
        'Para bloquear apps necesitamos el servicio de accesibilidad y el permiso de superposición.',
        [
          {text: 'Cancelar', style: 'cancel'},
          {text: 'Configurar', onPress: () => navigation.navigate('Permissions')},
        ],
      );
      return;
    }
    const {blockedApps, startEssentialMode} = useUserStore.getState();
    await BlockerNative.setBlockedPackages(blockedApps);
    await BlockerNative.startBlocking();
    startEssentialMode();
  }, [navigation]);

  const stop = useCallback(async () => {
    await BlockerNative.stopBlocking();
    const res = useUserStore.getState().stopEssentialMode();
    Alert.alert(
      'Sesión terminada',
      res.minutes >= 1
        ? `Enfocado ${res.minutes} min · +${res.points} puntos · Racha: ${res.streak} días`
        : 'La sesión fue muy corta para ganar puntos.',
    );
  }, []);

  const toggle = useCallback(() => (isActive ? stop() : start()), [isActive, start, stop]);

  return {isActive, start, stop, toggle};
}
