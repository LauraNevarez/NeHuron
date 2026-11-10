import React from 'react';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import NewActivityScreen from '../screens/NewActivityScreen';
import EvidencesScreen from '../screens/EvidencesScreen';
import useUserStore from '../store/useUserStore';
import {colors} from '../theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    primary: colors.primary,
    border: colors.border,
  },
};

export default function AppNavigator() {
  const isAuthenticated = useUserStore(s => s.isAuthenticated);
  const hasOnboarded = useUserStore(s => s.hasOnboarded);

  // Determinación de la pantalla inicial:
  // 1. Si no está autenticado -> 'Login' (Login First)
  // 2. Si ya está autenticado pero no completó onboarding -> 'Onboarding' o 'Permissions'
  // 3. Si ya está autenticado y listo -> 'Main' (Dashboard principal)
  const initialRoute = !isAuthenticated
    ? 'Login'
    : hasOnboarded
    ? 'Main'
    : 'Permissions';

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{headerShown: false}}>
        {/* Pantalla Raíz de Autenticación */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Flujo Existente */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Permissions" component={PermissionsScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Evidences" component={EvidencesScreen} />
        <Stack.Screen
          name="NewActivity"
          component={NewActivityScreen}
          options={{
            headerShown: true,
            title: 'Nueva actividad',
            headerStyle: {backgroundColor: colors.card},
            headerTintColor: colors.text,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
