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
  const totalDurationMinutes = useUserStore(s => s.totalDurationMinutes);
  const completedFocusMinutes = useUserStore(s => s.completedFocusMinutes);
  const pomodoroCycles = useUserStore(s => s.pomodoroCycles);
  const activeGoalName = useUserStore(s => s.activeGoalName);

  /**
   * Inicia el modo esencial para una meta o enfoque libre.
   * durationMin: minutos totales de la meta.
   * goalName: nombre de la meta (o null para enfoque libre).
   */
  const start = useCallback(async (durationMin = 25, goalName = null) => {
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
    startEssentialMode(durationMin, goalName);
  }, [navigation]);

  /**
   * Termina la sesión (sea por tiempo completado o por botón manual).
   * Si la meta finalizó o fue cancelada, desbloquea las apps y solicita evidencias si aplica.
   */
  const stop = useCallback(async (isAutoCompleted = false) => {
    await BlockerNative.stopBlocking();
    const res = useUserStore.getState().stopEssentialMode(isAutoCompleted);

    const title = res.fullyCompleted ? '🎉 ¡Sesión completada!' : 'Sesión terminada';
    let rewardText = '';
    if (res.givesReward) {
      rewardText = `+${res.points} puntos ganados · Racha: ${res.streak} días`;
    } else {
      rewardText = res.minutes >= 1
        ? `Duración: ${res.minutes} min (se requieren al menos 20 min de enfoque para ganar puntos).`
        : 'Sesión terminada antes de tiempo (sin puntos de recompensa).';
    }

    if (res.activeGoalName && navigation) {
      Alert.alert(
        title,
        `${rewardText}\n\n¿Deseas guardar una evidencia de lo que avanzaste en "${res.activeGoalName}"?`,
        [
          {text: 'Más tarde', style: 'cancel'},
          {
            text: 'Subir evidencia',
            onPress: () => navigation.navigate('Evidences', {autoPickForGoal: res.activeGoalName}),
          },
        ],
      );
    } else {
      Alert.alert(title, rewardText);
    }
  }, [navigation]);

  /** Inicia el descanso de gracia */
  const startGraceBreak = useCallback(async (minutes = 5) => {
    if (minutes <= 0) {
      // Si no tiene descanso, no entra en break
      return;
    }
    const {setPomodoroPhase} = useUserStore.getState();
    await BlockerNative.setGraceBreak(minutes);
    setPomodoroPhase('break');
  }, []);

  /** Termina el descanso y vuelve al siguiente ciclo de enfoque */
  const resumeFocus = useCallback(async () => {
    const {blockedApps, setPomodoroPhase} = useUserStore.getState();
    await BlockerNative.setBlockedPackages(blockedApps);
    await BlockerNative.endGraceBreak();
    await BlockerNative.startBlocking();
    setPomodoroPhase('focus');
  }, []);

  return {
    isActive,
    pomodoroPhase,
    phaseStartedAt,
    focusMinutes,
    graceMinutes,
    totalDurationMinutes,
    completedFocusMinutes,
    pomodoroCycles,
    activeGoalName,
    start,
    stop,
    startGraceBreak,
    resumeFocus,
  };
}
