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
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
};

export const getNextActivity = activities => {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const today = (activities || [])
    .filter(a => a.days.includes(todayIndex()))
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  return today.find(a => toMinutes(a.endTime) > nowMin) || today[0] || null;
};

export const getGoalDurationMinutes = activity => {
  if (!activity || !activity.startTime || !activity.endTime) return 25;

  const startM = toMinutes(activity.startTime);
  const endM = toMinutes(activity.endTime);

  // Log para debug — ver en Metro bundler qué valores llegan
  console.log(
    '[NeurOn] getGoalDurationMinutes → startTime:', activity.startTime,
    '| endTime:', activity.endTime,
    '| startM:', startM,
    '| endM:', endM,
    '| diff:', endM - startM,
  );

  const fullDiff = endM - startM;
  if (fullDiff <= 0) return 25; // horario inválido → fallback

  // Siempre usar la duración total de la meta (no los minutos restantes),
  // para que el temporizador muestre el tiempo completo sin importar la hora actual.
  return fullDiff;
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
