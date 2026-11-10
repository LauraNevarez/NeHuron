import React, {useMemo, useState, useEffect, useRef} from 'react';
import {View, Text, ScrollView, Pressable, Alert, StyleSheet, AppState, Modal} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ActivityCard from '../components/ActivityCard';
import CustomButton from '../components/CustomButton';
import useUserStore from '../store/useUserStore';
import useActivityStore from '../store/useActivityStore';
import useEssentialMode from '../hooks/useEssentialMode';
import {
  getNextActivity,
  getGoalDurationMinutes,
  getBreakMinutes,
  getTotalCycles,
  getFocusCycleLength,
} from '../utils/date';
import {colors, radius} from '../theme';

const QUICK_ACCESS = [
  {key: 'goals', label: 'Mis Metas', icon: 'flag-checkered', go: (nav, openProgress) => nav.navigate('NewActivity')},
  {key: 'evidence', label: 'Evidencias', icon: 'camera-outline', go: (nav, openProgress) => nav.navigate('Evidences')},
  {key: 'progress', label: 'Mi Progreso', icon: 'chart-timeline-variant', go: (nav, openProgress) => openProgress()},
];

export default function HomeScreen({navigation}) {
  const userName = useUserStore(s => s.userName);
  const userEmail = useUserStore(s => s.userEmail);
  const streakDays = useUserStore(s => s.streakDays);
  const focusHours = useUserStore(s => s.focusHours);
  const points = useUserStore(s => s.points);
  const activities = useActivityStore(s => s.activities);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const {
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
  } = useEssentialMode(navigation);

  const next = useMemo(() => getNextActivity(activities), [activities]);
  const [remainingSec, setRemainingSec] = useState(0);

  // Evitar disparos repetidos del cambio de fase
  const handlingPhaseChange = useRef(false);

  // ── Temporizador en tiempo real ──────────────────────────────────────────
  useEffect(() => {
    if (!isActive) {
      handlingPhaseChange.current = false;
      setRemainingSec(0);
      return;
    }

    const tick = () => {
      const currentDurationMin = pomodoroPhase === 'focus'
        ? (focusMinutes || 25)
        : (graceMinutes || 5);
      const totalMs = currentDurationMin * 60 * 1000;
      const elapsedMs = Date.now() - (phaseStartedAt || Date.now());
      const leftSec = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
      setRemainingSec(leftSec);

      if (leftSec <= 0 && !handlingPhaseChange.current) {
        handlingPhaseChange.current = true;

        if (pomodoroPhase === 'focus') {
          // Completar ciclo de enfoque actual
          const {completeFocusCycle} = useUserStore.getState();
          const cycleResult = completeFocusCycle();

          if (cycleResult.done) {
            // ¡Meta totalmente terminada! Termina sesión y pide evidencias
            stop(true);
          } else {
            // Hay más ciclos pendientes: revisar si corresponde descanso
            const gMin = graceMinutes;
            if (gMin > 0) {
              startGraceBreak(gMin).then(() => {
                handlingPhaseChange.current = false;
              });
              Alert.alert(
                '☕ ¡Tiempo de descanso!',
                `Completaste un ciclo de enfoque. Tienes ${gMin} min de descanso antes del siguiente ciclo. Apps desbloqueadas.`,
              );
            } else {
              // Sin descanso (metas menores a 20 min) -> pasar al siguiente ciclo directo
              resumeFocus().then(() => {
                handlingPhaseChange.current = false;
              });
            }
          }
        } else {
          // El descanso terminó -> volver al siguiente ciclo de enfoque
          resumeFocus().then(() => {
            handlingPhaseChange.current = false;
          });
          Alert.alert(
            '🛡️ ¡De vuelta al enfoque!',
            'Se acabó el descanso. El Modo Esencial ha vuelto a bloquear las apps.',
          );
        }
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isActive, pomodoroPhase, phaseStartedAt, focusMinutes, graceMinutes, startGraceBreak, resumeFocus, stop]);

  // ── Sincronización inmutable por delta al volver de segundo plano / Doze Mode ──
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && isActive) {
        const currentDurationMin = pomodoroPhase === 'focus'
          ? (focusMinutes || 25)
          : (graceMinutes || 5);
        const totalMs = currentDurationMin * 60 * 1000;
        const elapsedMs = Date.now() - (phaseStartedAt || Date.now());
        const leftSec = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
        setRemainingSec(leftSec);

        // Si el tiempo transcurrió totalmente mientras la pantalla estuvo apagada o en otra app:
        if (leftSec <= 0 && !handlingPhaseChange.current) {
          handlingPhaseChange.current = true;
          if (pomodoroPhase === 'focus') {
            const {completeFocusCycle} = useUserStore.getState();
            const cycleResult = completeFocusCycle();
            if (cycleResult.done) {
              stop(true);
            } else {
              const gMin = graceMinutes || 5;
              startGraceBreak(gMin).then(() => {
                handlingPhaseChange.current = false;
              });
            }
          } else {
            resumeFocus().then(() => {
              handlingPhaseChange.current = false;
            });
          }
        }
      }
    });

    return () => sub.remove();
  }, [isActive, pomodoroPhase, phaseStartedAt, focusMinutes, graceMinutes, startGraceBreak, resumeFocus, stop]);

  const formatTime = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Datos calculados de la siguiente meta
  const nextDuration = next ? getGoalDurationMinutes(next) : 25;
  const nextBreak = getBreakMinutes(nextDuration);
  const nextTotalCycles = getTotalCycles(nextDuration);
  const nextCycleLen = getFocusCycleLength(nextDuration);

  // Progreso exacto en segundos para avance en tiempo real
  const currentTotalCycles = getTotalCycles(totalDurationMinutes);
  const currentCycleNum = Math.min(
    currentTotalCycles,
    Math.floor(completedFocusMinutes / 25) + 1,
  );

  const totalSec = Math.max(1, (totalDurationMinutes || 25) * 60);
  const currentCycleTotalSec = (focusMinutes || 25) * 60;
  const currentCycleElapsedSec = pomodoroPhase === 'focus'
    ? Math.max(0, Math.min(currentCycleTotalSec, currentCycleTotalSec - remainingSec))
    : currentCycleTotalSec;

  const totalElapsedSec = Math.min(
    totalSec,
    (completedFocusMinutes * 60) + currentCycleElapsedSec,
  );
  const progressRatio = totalElapsedSec / totalSec;
  const progressPercent = Math.min(100, Math.round(progressRatio * 100));

  const elapsedMinutes = Math.floor(totalElapsedSec / 60);
  const elapsedSeconds = totalElapsedSec % 60;
  const progressLabel = elapsedMinutes > 0
    ? `${elapsedMinutes}m ${elapsedSeconds}s de ${totalDurationMinutes} min (${progressPercent}%)`
    : `${elapsedSeconds}s de ${totalDurationMinutes} min (${progressPercent}%)`;

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
                    {pomodoroPhase === 'break' ? 'DESCANSO' : 'ENFOQUE ACTIVO'}
                  </Text>
                </View>
                <Text style={styles.pomodoroCycleText}>
                  {activeGoalName ? `${activeGoalName}` : 'Enfoque Libre'} · Ciclo {currentCycleNum}/{currentTotalCycles}
                </Text>
              </View>

              <Text style={styles.pomodoroTimer}>{formatTime(remainingSec)}</Text>

              {/* Barra de progreso de la meta */}
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, {width: `${Math.max(1, progressRatio * 100)}%`}]} />
              </View>
              <Text style={styles.progressText}>
                {progressLabel}
              </Text>

              <Text style={styles.pomodoroSubtitle}>
                {pomodoroPhase === 'break'
                  ? `☕ Apps desbloqueadas · Disfruta tus ${graceMinutes} min de descanso`
                  : graceMinutes > 0
                    ? `🛡️ Apps bloqueadas · ${graceMinutes} min de descanso tras este ciclo`
                    : '🛡️ Apps bloqueadas · Meta sin descanso (< 20 min)'}
              </Text>

              <View style={styles.pomodoroActions}>
                {pomodoroPhase === 'focus' && graceMinutes > 0 ? (
                  <Pressable
                    style={[styles.pomoBtn, styles.pomoBreakBtn]}
                    onPress={() => {
                      handlingPhaseChange.current = false;
                      startGraceBreak(graceMinutes);
                    }}>
                    <Icon name="coffee-outline" size={18} color="#1A1200" />
                    <Text style={styles.pomoBreakBtnText}>Tomar descanso</Text>
                  </Pressable>
                ) : pomodoroPhase === 'break' ? (
                  <Pressable
                    style={[styles.pomoBtn, styles.pomoFocusBtn]}
                    onPress={() => {
                      handlingPhaseChange.current = false;
                      resumeFocus();
                    }}>
                    <Icon name="shield-lock-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.pomoFocusBtnText}>Volver al enfoque</Text>
                  </Pressable>
                ) : null}

                <Pressable style={[styles.pomoBtn, styles.pomoStopBtn]} onPress={() => stop(false)}>
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
                    const dur = getGoalDurationMinutes(next);
                    start(dur, next.name);
                  }}
                  style={{marginTop: -4, marginBottom: 4}}
                />
                <View style={styles.metaInfoRow}>
                  <Text style={styles.metaInfoText}>
                    ⏱ {nextDuration} min {nextTotalCycles > 1 ? `· ${nextTotalCycles} ciclos (bloques de ${nextCycleLen} min)` : '· 1 ciclo'}
                  </Text>
                  <Text style={styles.metaInfoText}>
                    {nextBreak > 0 ? `☕ ${nextBreak} min de descanso por ciclo` : '⚡ Sin descanso'} {nextDuration >= 20 ? '· Con recompensa' : '· Sin recompensa'}
                  </Text>
                </View>
              </View>
            ) : (
              <Pressable style={styles.empty} onPress={() => navigation.navigate('NewActivity')}>
                <Icon name="plus-circle-outline" size={28} color={colors.accent} />
                <Text style={styles.emptyText}>No tienes metas para hoy. ¡Crea una!</Text>
              </Pressable>
            )}

            {/* Enfoque libre (bloqueo sin meta) */}
            <Text style={styles.section}>Bloqueo de apps libre</Text>
            <View style={styles.freeFocusCard}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.freeFocusTitle}>¿Quieres concentrarte sin meta?</Text>
                <Text style={styles.freeFocusSub}>Activa el Modo Esencial directamente con 25 min de enfoque.</Text>
              </View>
              <Pressable
                style={styles.freeFocusBtn}
                onPress={() => start(25, null)}>
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
            <Pressable
              key={q.key}
              style={styles.tile}
              onPress={() => q.go(navigation, () => setShowProgressModal(true))}>
              <Icon name={q.icon} size={30} color={colors.primary} />
              <Text style={styles.tileText}>{q.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Modal Ligero: Mi Progreso (Colección Progress MongoDB) */}
      <Modal
        visible={showProgressModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProgressModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon name="chart-timeline-variant" size={24} color={colors.primary} />
                <Text style={styles.modalTitle}>Mi Progreso</Text>
              </View>
              <Pressable onPress={() => setShowProgressModal(false)} hitSlop={10}>
                <Icon name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <Text style={styles.modalSubtitle}>
              Datos sincronizados con MongoDB ({userEmail || 'tester@neuron.com'})
            </Text>

            <View style={styles.progressRow}>
              <View style={styles.progressStat}>
                <Text style={styles.progressEmoji}>🔥</Text>
                <Text style={styles.progressVal}>{streakDays}</Text>
                <Text style={styles.progressLbl}>Días de Racha</Text>
              </View>

              <View style={styles.progressStat}>
                <Text style={styles.progressEmoji}>⏱️</Text>
                <Text style={styles.progressVal}>{focusHours.toFixed(1)} h</Text>
                <Text style={styles.progressLbl}>Horas de Enfoque</Text>
              </View>

              <View style={styles.progressStat}>
                <Text style={styles.progressEmoji}>🪙</Text>
                <Text style={styles.progressVal}>{points}</Text>
                <Text style={styles.progressLbl}>Tokens / Puntos</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalChartBtn}
                onPress={() => {
                  setShowProgressModal(false);
                  navigation.navigate('Rendimiento');
                }}>
                <Icon name="chart-bar" size={18} color="#FFFFFF" style={{marginRight: 6}} />
                <Text style={styles.modalChartBtnText}>Ver Gráfica de Rendimiento</Text>
              </Pressable>

              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setShowProgressModal(false)}>
                <Text style={styles.modalCloseBtnText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginLeft: 8,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressStat: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  progressVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  progressLbl: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  modalActions: {
    marginTop: 8,
  },
  modalChartBtn: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalChartBtnText: {
    color: '#1A1200',
    fontWeight: '800',
    fontSize: 14,
  },
  modalCloseBtn: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCloseBtnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
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
  metaInfoRow: {marginTop: 6, marginBottom: 8},
  metaInfoText: {color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: 2, fontWeight: '500'},

  // Tarjeta de Enfoque Libre
  freeFocusCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border,
  },
  freeFocusTitle: {color: colors.text, fontSize: 14, fontWeight: '700'},
  freeFocusSub: {color: colors.muted, fontSize: 12, marginTop: 2},
  freeFocusBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.sm,
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
    backgroundColor: colors.card, borderRadius: radius.lg, padding: 18,
    borderWidth: 2, borderColor: colors.accent, alignItems: 'center', marginTop: 4,
  },
  pomodoroBreakCard: {borderColor: colors.success, backgroundColor: colors.cardAlt},
  pomodoroHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', marginBottom: 8,
  },
  pomodoroBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 14,
  },
  badgeFocus: {backgroundColor: colors.accent},
  badgeBreak: {backgroundColor: colors.success},
  pomodoroBadgeText: {fontSize: 12, fontWeight: '800', color: '#1A1200', marginLeft: 4},
  pomodoroCycleText: {color: colors.muted, fontSize: 12, fontWeight: '700'},
  pomodoroTimer: {fontSize: 48, fontWeight: '900', color: colors.text, letterSpacing: 2, marginVertical: 4},
  progressBar: {
    width: '100%', height: 6, backgroundColor: colors.border,
    borderRadius: 3, overflow: 'hidden', marginTop: 4,
  },
  progressFill: {height: '100%', backgroundColor: colors.primary, borderRadius: 3},
  progressText: {color: colors.muted, fontSize: 11, marginTop: 4, marginBottom: 8},
  pomodoroSubtitle: {color: colors.muted, fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 16},
  pomodoroActions: {flexDirection: 'row', width: '100%', justifyContent: 'space-between'},
  pomoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: radius.md, marginHorizontal: 4,
  },
  pomoBreakBtn: {backgroundColor: colors.accent},
  pomoBreakBtnText: {color: '#1A1200', fontWeight: '700', fontSize: 13, marginLeft: 4},
  pomoFocusBtn: {backgroundColor: colors.primary},
  pomoFocusBtnText: {color: '#FFFFFF', fontWeight: '700', fontSize: 13, marginLeft: 4},
  pomoStopBtn: {backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger},
  pomoStopBtnText: {color: colors.danger, fontWeight: '700', fontSize: 13, marginLeft: 4},
});
