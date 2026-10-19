import React, {useMemo} from 'react';
import {View, Text, ScrollView, Pressable, Alert, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ActivityCard from '../components/ActivityCard';
import CustomButton from '../components/CustomButton';
import useUserStore from '../store/useUserStore';
import useActivityStore from '../store/useActivityStore';
import useEssentialMode from '../hooks/useEssentialMode';
import {getNextActivity} from '../utils/date';
import {colors, radius} from '../theme';

const QUICK_ACCESS = [
  {key: 'goals', label: 'Mis Metas', icon: 'flag-checkered', go: nav => nav.navigate('NewActivity')},
  {key: 'schedule', label: 'Mi Horario', icon: 'calendar-clock', go: nav => nav.navigate('Horario')},
  {key: 'teams', label: 'Equipos', icon: 'account-group', go: () => Alert.alert('Próximamente', 'Equipos estará disponible pronto.')},
  {key: 'evidence', label: 'Evidencias', icon: 'camera-outline', go: () => Alert.alert('Próximamente', 'Evidencias estará disponible pronto.')},
  {key: 'monitor', label: 'Monitoreo', icon: 'monitor-eye', go: () => Alert.alert('Próximamente', 'Monitoreo estará disponible pronto.')},
  {key: 'stats', label: 'Estadísticas', icon: 'chart-bar', go: nav => nav.navigate('Rendimiento')},
];

export default function HomeScreen({navigation}) {
  const userName = useUserStore(s => s.userName);
  const streakDays = useUserStore(s => s.streakDays);
  const focusHours = useUserStore(s => s.focusHours);
  const points = useUserStore(s => s.points);
  const activities = useActivityStore(s => s.activities);
  const {isActive, toggle, start} = useEssentialMode(navigation);

  const next = useMemo(() => getNextActivity(activities), [activities]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={{flex: 1}}>
            <Text style={styles.hello}>¡Hola, {userName}!</Text>
            <Text style={styles.points}>🪙 {points} puntos</Text>
          </View>
          <View style={styles.pill}>
            <Icon name="fire" size={20} color="#FF7A2F" />
            <Text style={styles.pillText}>{streakDays}</Text>
          </View>
          <View style={[styles.pill, {marginLeft: 8}]}>
            <Icon name="clock-check-outline" size={20} color={colors.success} />
            <Text style={styles.pillText}>{focusHours.toFixed(1)} h</Text>
          </View>
        </View>

        {/* Próxima Meta */}
        <Text style={styles.section}>Próxima meta</Text>
        {next ? (
          <ActivityCard activity={next} highlight onPlay={() => (isActive ? null : start())} />
        ) : (
          <Pressable style={styles.empty} onPress={() => navigation.navigate('NewActivity')}>
            <Icon name="plus-circle-outline" size={28} color={colors.accent} />
            <Text style={styles.emptyText}>No tienes metas para hoy. ¡Crea una!</Text>
          </Pressable>
        )}

        {/* Modo Esencial */}
        <CustomButton
          title={isActive ? 'DETENER MODO ESENCIAL' : 'INICIAR MODO ESENCIAL'}
          icon={isActive ? 'stop-circle-outline' : 'shield-lock-outline'}
          variant={isActive ? 'danger' : 'accent'}
          onPress={toggle}
          style={styles.mainBtn}
        />
        {isActive && <Text style={styles.active}>🛡️ Modo Esencial activo: apps de distracción bloqueadas</Text>}

        {/* Accesos rápidos */}
        <Text style={styles.section}>Accesos rápidos</Text>
        <View style={styles.grid}>
          {QUICK_ACCESS.map(q => (
            <Pressable key={q.key} style={styles.tile} onPress={() => q.go(navigation)}>
              <Icon name={q.icon} size={30} color={colors.primary} />
              <Text style={styles.tileText}>{q.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.bg},
  scroll: {padding: 16, paddingBottom: 32},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  hello: {color: colors.text, fontSize: 24, fontWeight: '800'},
  points: {color: colors.accent, marginTop: 2, fontWeight: '600'},
  pill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border,
  },
  pillText: {color: colors.text, fontWeight: '700', marginLeft: 4},
  section: {color: colors.muted, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 18, marginBottom: 10},
  empty: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md,
    padding: 18, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  emptyText: {color: colors.muted, marginLeft: 10, flex: 1},
  mainBtn: {marginTop: 18, paddingVertical: 18},
  active: {color: colors.success, textAlign: 'center', marginTop: 10, fontSize: 13},
  grid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  tile: {
    width: '31%', aspectRatio: 1, backgroundColor: colors.card, borderRadius: radius.md, marginBottom: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  tileText: {color: colors.text, fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center'},
});
