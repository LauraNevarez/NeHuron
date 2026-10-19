import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ClosetScreen from '../screens/ClosetScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import {colors} from '../theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Inicio: 'home-variant',
  Horario: 'calendar-clock',
  Armario: 'hanger',
  Rendimiento: 'chart-line',
  Ajustes: 'cog',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {backgroundColor: colors.card, borderTopColor: colors.border, height: 62, paddingBottom: 8},
        tabBarIcon: ({color, size}) => <Icon name={ICONS[route.name]} size={size} color={color} />,
      })}>
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Horario" component={ScheduleScreen} />
      <Tab.Screen name="Armario" component={ClosetScreen} />
      <Tab.Screen name="Rendimiento" component={StatsScreen} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
