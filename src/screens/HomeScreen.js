import React, {useMemo, useState, useEffect} from 'react';
import {View, Text, ScrollView, Pressable, Alert, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ActivityCard from '../components/ActivityCard';
import CustomButton from '../components/CustomButton';
import useUserStore from '../store/useUserStore';
import useActivityStore from '../store/useActivityStore';
import useEssentialMode from '../hooks/useEssentialMode';
import {getNextActivity, getGoalDurationMinutes, toMinutes, dateKey, todayIndex} from '../utils/date';
import {colors, radius} from '../theme';

const QUICK_ACCESS = [
  {key: 'goals', label: 'Mis Metas', icon: 'flag-checkered', go: nav => nav.navigate('NewActivity')},
  {key: 'schedule', label: 'Mi Horario', icon: 'calendar-clock', go: nav => nav.navigate('Horario')},
  {key: 'evidence', label: 'Evidencias', icon: 'camera-outline', go: nav => nav.navigate('Evidences')},
  {key: 'teams', label: 'Equipos', icon: 'account-group', go: () => Alert.alert('Próximamente', 'Equipos estará disponible pronto.')},
  {key: 'monitor', label: 'Monitoreo', icon: 'monitor-eye', go: () => Alert.alert('Próximamente', 'Monitoreo estará disponible pronto.')},
  {key: 'stats', label: 'Estadísticas', icon: 'chart-bar', go: nav => nav.navigate('Rendimiento')},
];

export default function HomeScreen({navigation}) {
  const userName = useUserStore(s => s.userName);
  const streakDays = useUserStore(s => s.streakDays);
  const focusHours = useUserStore(s => s.focusHours);
  const points = useUserStore(s => s.points);
  const activities = useActivityStore(s => s.activities);
  const promptedGoals = useActivityStore(s => s.promptedGoals);
  const markGoalPrompted = useActivityStore(s => s.markGoalPrompted);

  const {
    isActive,
    pomodoroPhase,
    phaseStartedAt,
    focusMinutes,
    graceMinutes,
    pomodoroCycles,
    activeGoalName,
    start,
    stop,
    startGraceBreak,
    resumeFocus,
  } = useEssentialMode(navigation);

  const next = useMemo(() => getNextActivity(activities), [activities]);
  const goalGraceMinutes = next?.graceMinutes && next.graceMinutes > 0 ? next.graceMinutes : 5;

  const [remainingSec, setRemainingSec] = useState(0);

  // Temporizador en tiempo real
  useEffect(() => {
    if (!isActive) return;

    const tick = () => {
      const currentDurationMin = pomodoroPhase === 'focus' ? (focusMinutes || 25) : (graceMinutes || 5);
      const totalMs = currentDurationMin * 60 * 1000;
      const elapsedMs = Date.now() - (phaseStartedAt || Date.now());
      const leftSec = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
      setRemainingSec(leftSec);

      if (leftSec <= 0) {
        if (pomodoroPhase === 'focus') {
          const gMin = graceMinutes || goalGraceMinutes;
          startGraceBreak(gMin);
          Alert.alert(
            '☕ ¡Tiempo de Gracia!',
            `Has completado ${focusMinutes || 25} minutos de enfoque. Tienes ${gMin} minutos de gracia para usar tus apps y relajarte.`,
          );
        } else {
          resumeFocus();
          Alert.alert(
            '🛡️ ¡De vuelta al enfoque!',
            'Se acabaron los minutos de gracia. El Modo Esencial ha vuelto a bloquear las apps de distracción.',
          );
        }
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isActive, pomodoroPhase, phaseStartedAt, focusMinutes, graceMinutes, goalGraceMinutes, startGraceBreak, resumeFocus]);

  // Detectar automáticamente cuando termina el horario de una meta y pedir evidencia
  useEffect(() => {
    const checkGoalEnd = () => {
      const today = dateKey();
      const todayIdx = todayIndex();
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const alreadyPrompted = promptedGoals[today] || [];

      activities
        .filter(a => a.days && a.days.includes(todayIdx))
        .filter(a => toMinutes(a.endTime) <= nowMin)
        .filter(a => !alreadyPrompted.includes(a.id))
        .forEach(a => {
          markGoalPrompted(a.id, today);
          Alert.alert(
            `✅ Meta terminada: ${a.name}`,
            '¿Deseas guardar una evidencia de lo que trabajaste? (foto de apuntes, pantalla, etc.)',
            [
              {text: 'Más tarde', style: 'cancel'},
              {
                text: 'Subir evidencia',
                onPress: () => navigation.navigate('Evidences', {autoPickForGoal: a.name}),
              },
            ],
          );
        });
    };

    checkGoalEnd(); // verificar al montar
    const interval = setInterval(checkGoalEnd, 60_000); // cada minuto
    return () => clearInterval(interval);
  }, [activities, promptedGoals, markGoalPrompted, navigation]);

  const formatTime = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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

        {/* Panel Activo de Modo Esencial / Pomodoro */}
        {isActive ? (
          <View style={{marginTop: 10}}>
            <Text style={styles.section}>Sesión de Enfoque en Curso</Text>
            <View style={[styles.pomodoroCard, pomodoroPhase === 'break' && styles.pomodoroBreakCard]}>
              <View style={styles.pomodoroHeader}>
                <View style={[styles.pomodoroBadge, pomodoroPhase === 'break' ? styles.badgeBreak : styles.badgeFocus]}>
                  <Icon
                    name={pomodoroPhase === 'break' ? 'coffee' : 'fire'}
                    size={16}
                    color={pomodoroPhase === 'break' ? '#FFFFFF' : '#1A1200'}
                  />
                  <Text style={[styles.pomodoroBadgeText, pomodoroPhase === 'break' && {color: '#FFFFFF'}]}>
                    {pomodoroPhase === 'break' ? 'MINUTOS DE GRACIA' : 'ENFOQUE ACTIVO'}
                  </Text>
                </View>
                <Text style={styles.pomodoroCycleText}>
                  {activeGoalName ? `Meta: ${activeGoalName}` : 'Enfoque Libre'} · Ciclo {pomodoroCycles + 1}
                </Text>
              </View>

              <Text style={styles.pomodoroTimer}>{formatTime(remainingSec)}</Text>

              <Text style={styles.pomodoroSubtitle}>
                {pomodoroPhase === 'break'
                  ? '☕ Apps desbloqueadas · Disfruta tus minutos de gracia'
                  : `🛡️ Apps bloqueadas · Próximos: ${graceMinutes || goalGraceMinutes} min de descanso`}
              </Text>

              <View style={styles.pomodoroActions}>
                {pomodoroPhase === 'focus' ? (
                  <Pressable
                    style={[styles.pomoBtn, styles.pomoBreakBtn]}
                    onPress={() => startGraceBreak(graceMinutes || goalGraceMinutes)}>
                    <Icon name="coffee-outline" size={18} color="#1A1200" />
                    <Text style={styles.pomoBreakBtnText}>Tomar gracia ya</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={[styles.pomoBtn, styles.pomoFocusBtn]}
                    onPress={resumeFocus}>
                    <Icon name="shield-lock-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.pomoFocusBtnText}>Volver al enfoque</Text>
                  </Pressable>
                )}

                <Pressable style={[styles.pomoBtn, styles.pomoStopBtn]} onPress={stop}>
                  <Icon name="stop-circle-outline" size={18} color={colors.danger} />
                  <Text style={styles.pomoStopBtnText}>Terminar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          /* Cuando NO hay sesión activa */
          <>
            {/* Próxima Meta */}
            <Text style={styles.section}>Próxima meta de hoy</Text>
            {next ? (
              <View>
                <ActivityCard activity={next} highlight />
                <CustomButton
                  title={`INICIAR META: ${next.name}`}
                  icon="shield-lock-outline"
                  variant="accent"
                  onPress={() => {
                    // Calcular en tiempo real al presionar (evita cache de useMemo)
                    const focusMin = getGoalDurationMinutes(next);
                    const graceMin = next.graceMinutes > 0 ? next.graceMinutes : 5;
                    console.log('[NeurOn] Iniciando meta:', next.name,
                      '| startTime:', next.startTime,
                      '| endTime:', next.endTime,
                      '| focusMin calculado:', focusMin,
                      '| graceMin:', graceMin,
                    );
                    start(focusMin, graceMin, next.name);
                  }}
                  style={{marginTop: -4, marginBottom: 4}}
                />
                <Text style={styles.hint}>
                  Bloquea apps por {getGoalDurationMinutes(next)} min de enfoque + {goalGraceMinutes} min de gracia
                </Text>
              </View>
            ) : (
              <Pressable style={styles.empty} onPress={() => navigation.navigate('NewActivity')}>
                <Icon name="plus-circle-outline" size={28} color={colors.accent} />
                <Text style={styles.emptyText}>No tienes metas para hoy. ¡Crea una!</Text>
              </Pressable>
            )}

            {/* Enfoque libre (solo bloqueo de apps sin meta) */}
            <Text style={styles.section}>Bloqueo de apps libre</Text>
            <View style={styles.freeFocusCard}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.freeFocusTitle}>¿Quieres concentrarte sin meta?</Text>
                <Text style={styles.freeFocusSub}>Activa el Modo Esencial para bloquear distracciones directamente.</Text>
              </View>
              <Pressable
                style={styles.freeFocusBtn}
                onPress={() => start(25, 5, null)}>
                <Icon name="shield-lock" size={20} color="#FFFFFF" />
                <Text style={styles.freeFocusBtnText}>Bloquear</Text>
              </Pressable>
            </View>
          </>
        )}

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
  hint: {color: colors.muted, textAlign: 'center', marginTop: 6, fontSize: 12},

  // Tarjeta de Enfoque Libre
  freeFocusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  freeFocusTitle: {color: colors.text, fontSize: 14, fontWeight: '700'},
  freeFocusSub: {color: colors.muted, fontSize: 12, marginTop: 2},
  freeFocusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },
  freeFocusBtnText: {color: '#FFFFFF', fontWeight: '700', fontSize: 13, marginLeft: 4},

  grid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'},
  tile: {
    width: '31%', aspectRatio: 1, backgroundColor: colors.card, borderRadius: radius.md, marginBottom: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
  },
  tileText: {color: colors.text, fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center'},

  // Pomodoro Card
  pomodoroCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    marginTop: 4,
  },
  pomodoroBreakCard: {
    borderColor: colors.success,
    backgroundColor: colors.cardAlt,
  },
  pomodoroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  pomodoroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeFocus: {backgroundColor: colors.accent},
  badgeBreak: {backgroundColor: colors.success},
  pomodoroBadgeText: {fontSize: 12, fontWeight: '800', color: '#1A1200', marginLeft: 4},
  pomodoroCycleText: {color: colors.muted, fontSize: 12, fontWeight: '700'},
  pomodoroTimer: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 2,
    marginVertical: 4,
  },
  pomodoroSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  pomodoroActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  pomoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.md,
    marginHorizontal: 4,
  },
  pomoBreakBtn: {backgroundColor: colors.accent},
  pomoBreakBtnText: {color: '#1A1200', fontWeight: '700', fontSize: 13, marginLeft: 4},
  pomoFocusBtn: {backgroundColor: colors.primary},
  pomoFocusBtnText: {color: '#FFFFFF', fontWeight: '700', fontSize: 13, marginLeft: 4},
  pomoStopBtn: {backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger},
  pomoStopBtnText: {color: colors.danger, fontWeight: '700', fontSize: 13, marginLeft: 4},
});
