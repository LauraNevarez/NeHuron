import {useCallback} from 'react';
import {Alert} from 'react-native';
import useUserStore from '../store/useUserStore';
import BlockerNative from '../modules/BlockerNativeModule';

export default function useEssentialMode(navigation) {
  const isActive = useUserStore(s => s.isEssentialModeActive);
  const pomodoroPhase = useUserStore(s => s.pomodoroPhase);
  const phaseStartedAt = useUserStore(s => s.phaseStartedAt);
  const focusMinutes = useUserStore(s => s.focusMinutes);
  const graceMinutes = useUserStore(s => s.graceMinutes);
  const pomodoroCycles = useUserStore(s => s.pomodoroCycles);
  const activeGoalName = useUserStore(s => s.activeGoalName);

  const start = useCallback(async (focusMin = 25, graceMin = 5, goalName = null) => {
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
    await BlockerNative.endGraceBreak();
    await BlockerNative.startBlocking();
    startEssentialMode(focusMin, graceMin, goalName);
  }, [navigation]);

  const stop = useCallback(async () => {
    await BlockerNative.stopBlocking();
    const res = useUserStore.getState().stopEssentialMode();
    const cycleText = res.cycles > 0 ? ` · ${res.cycles} Pomodoros` : '';
    const pointsMsg = res.minutes >= 1
      ? `Enfocado ${res.minutes} min${cycleText} · +${res.points} puntos · Racha: ${res.streak} días`
      : 'La sesión fue muy corta para ganar puntos.';

    if (res.activeGoalName && navigation) {
      Alert.alert(
        '¡Meta completada!',
        `${pointsMsg}\n\n¿Deseas guardar una foto de tus apuntes en la carpeta de "${res.activeGoalName}"?`,
        [
          {text: 'Más tarde', style: 'cancel'},
          {
            text: 'Subir evidencia',
            onPress: () => navigation.navigate('Evidences'),
          },
        ],
      );
    } else {
      Alert.alert('Sesión terminada', pointsMsg);
    }
  }, [navigation]);

  const startGraceBreak = useCallback(async (minutes = 5) => {
    const {setPomodoroPhase} = useUserStore.getState();
    await BlockerNative.setGraceBreak(minutes);
    setPomodoroPhase('break');
  }, []);

  const resumeFocus = useCallback(async () => {
    const {blockedApps, setPomodoroPhase} = useUserStore.getState();
    await BlockerNative.setBlockedPackages(blockedApps);
    await BlockerNative.endGraceBreak();
    await BlockerNative.startBlocking();
    setPomodoroPhase('focus');
  }, []);

  const toggle = useCallback((fMin = 25, gMin = 5, gName = null) =>
    (isActive ? stop() : start(fMin, gMin, gName)), [isActive, start, stop]);

  return {
    isActive,
    pomodoroPhase,
    phaseStartedAt,
    focusMinutes,
    graceMinutes,
    pomodoroCycles,
    activeGoalName,
    start,
    stop,
    toggle,
    startGraceBreak,
    resumeFocus,
  };
}
