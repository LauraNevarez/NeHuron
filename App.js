import React, {useEffect} from 'react';
import {StatusBar, AppState} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import BlockerNative from './src/modules/BlockerNativeModule';
import useUserStore from './src/store/useUserStore';
import {colors} from './src/theme';

export default function App() {
  // Sincroniza bidireccionalmente el estado nativo con el store al abrir y al volver al primer plano
  useEffect(() => {
    const syncNativeState = async () => {
      const {
        isEssentialModeActive,
        blockedApps,
        pomodoroPhase,
        phaseStartedAt,
        focusMinutes,
        graceMinutes,
        setPomodoroPhase,
      } = useUserStore.getState();

      if (isEssentialModeActive) {
        await BlockerNative.setBlockedPackages(blockedApps);

        const currentDurationMin = pomodoroPhase === 'focus' ? (focusMinutes || 25) : (graceMinutes || 5);
        const elapsedMs = Date.now() - (phaseStartedAt || Date.now());
        const totalDurationMs = currentDurationMin * 60 * 1000;

        if (elapsedMs >= totalDurationMs) {
          // Ya venció la fase mientras estaba fuera: alternar fase
          if (pomodoroPhase === 'focus') {
            setPomodoroPhase('break');
            await BlockerNative.setGraceBreak(graceMinutes || 5);
          } else {
            setPomodoroPhase('focus');
            await BlockerNative.endGraceBreak();
            await BlockerNative.startBlocking();
          }
        } else {
          // La fase sigue en curso
          if (pomodoroPhase === 'break') {
            const remainingMinutes = Math.max(0.1, (totalDurationMs - elapsedMs) / 60000);
            await BlockerNative.setGraceBreak(remainingMinutes);
          } else {
            await BlockerNative.endGraceBreak();
            await BlockerNative.startBlocking();
          }
        }
      } else {
        await BlockerNative.stopBlocking();
      }
    };

    syncNativeState();

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        syncNativeState();
      }
    });

    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
