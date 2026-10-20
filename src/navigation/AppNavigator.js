import React from 'react';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import NewActivityScreen from '../screens/NewActivityScreen';
import EvidencesScreen from '../screens/EvidencesScreen';
import useUserStore from '../store/useUserStore';
import {colors} from '../theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {...DarkTheme.colors, background: colors.bg, card: colors.card, primary: colors.primary, border: colors.border},
};

export default function AppNavigator() {
  const hasOnboarded = useUserStore(s => s.hasOnboarded);

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={hasOnboarded ? 'Main' : 'Onboarding'}
        screenOptions={{headerShown: false}}>
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
