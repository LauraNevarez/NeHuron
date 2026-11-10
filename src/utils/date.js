export const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
export const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// 0 = lunes ... 6 = domingo
export const todayIndex = (d = new Date()) => (d.getDay() + 6) % 7;

export const dateKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
};

export const toHHMM = date =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export const fromHHMM = str => {
  const [h, m] = str.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

export const toMinutes = str => {
  if (!str || typeof str !== 'string') return 0;
  const [h, m] = str.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** Devuelve la duración en minutos de una actividad (usa durationMinutes si existe, o calcula diff si es formato viejo). */
export const getGoalDurationMinutes = activity => {
  if (!activity) return 25;
  if (activity.durationMinutes && activity.durationMinutes > 0) {
    return activity.durationMinutes;
  }
  if (activity.startTime && activity.endTime) {
    const diff = toMinutes(activity.endTime) - toMinutes(activity.startTime);
    return diff > 0 ? diff : 25;
  }
  return 25;
};

/**
 * Reglas de descanso:
 * - Menos de 20 min: 0 min (sin descanso)
 * - De 20 a 60 min: 5 min de descanso
 * - Más de 60 min: 10 min de descanso
 */
export const getBreakMinutes = totalDuration => {
  if (totalDuration < 20) return 0;
  if (totalDuration <= 60) return 5;
  return 10;
};

/**
 * Solo se otorga recompensa si la meta duró 20 mins o más.
 */
export const sessionGivesReward = totalDuration => totalDuration >= 20;

/**
 * Duración de cada ciclo de enfoque:
 * Si es más de 25 min, se divide en bloques de 25 min.
 */
export const getFocusCycleLength = totalDuration => Math.min(25, totalDuration);

/** Número total de ciclos para completar la sesión */
export const getTotalCycles = totalDuration => Math.max(1, Math.ceil(totalDuration / 25));

/** Retorna la primera meta programada para hoy */
export const getNextActivity = activities => {
  const todayIdx = todayIndex();
  const today = (activities || [])
    .filter(a => a.days && a.days.includes(todayIdx))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return today[0] || null;
};

export const lastNDays = (n = 7) => {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({key: dateKey(d), label: DAY_LABELS[todayIndex(d)]});
  }
  return out;
};
