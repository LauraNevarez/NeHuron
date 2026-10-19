import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import BlockerNative from './src/modules/BlockerNativeModule';
import useUserStore from './src/store/useUserStore';
import {colors} from './src/theme';

export default function App() {
  // Sincroniza el estado nativo con el store al abrir la app
  useEffect(() => {
    if (!useUserStore.getState().isEssentialModeActive) {
      BlockerNative.stopBlocking();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
