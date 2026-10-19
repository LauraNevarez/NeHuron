import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from './mmkv';
import {dateKey, yesterdayKey} from '../utils/date';
import {DEFAULT_BLOCKED_APPS} from '../data/shopItems';

const initialState = {
  hasOnboarded: false,
  userName: 'Amigo',
  points: 1200,
  streakDays: 0,
  lastActiveDate: null,
  focusHours: 0,
  focusLog: {}, // { 'YYYY-MM-DD': minutos }
  isEssentialModeActive: false,
  sessionStartedAt: null,
  blockedApps: DEFAULT_BLOCKED_APPS.map(a => a.pkg),
  unlockedItems: [],
  equippedGlasses: null,
  equippedHat: null,
};

const useUserStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      setUserName: userName => set({userName}),
      completeOnboarding: () => set({hasOnboarded: true}),
      addPoints: n => set(s => ({points: s.points + n})),

      toggleBlockedApp: pkg =>
        set(s => ({
          blockedApps: s.blockedApps.includes(pkg)
            ? s.blockedApps.filter(p => p !== pkg)
            : [...s.blockedApps, pkg],
        })),

      // ---- Modo Esencial ----
      startEssentialMode: () => set({isEssentialModeActive: true, sessionStartedAt: Date.now()}),

      stopEssentialMode: () => {
        const s = get();
        const minutes = s.sessionStartedAt
          ? Math.floor((Date.now() - s.sessionStartedAt) / 60000)
          : 0;
        const today = dateKey();
        let streak = s.streakDays;
        let lastActiveDate = s.lastActiveDate;

        if (minutes >= 1) {
          if (s.lastActiveDate === today) {
            // ya contó hoy
          } else if (s.lastActiveDate === yesterdayKey()) {
            streak += 1;
          } else {
            streak = 1;
          }
          lastActiveDate = today;
        }

        const earned = minutes; // 1 punto por minuto enfocado
        set({
          isEssentialModeActive: false,
          sessionStartedAt: null,
          points: s.points + earned,
          focusHours: +(s.focusHours + minutes / 60).toFixed(2),
          focusLog: {...s.focusLog, [today]: (s.focusLog[today] || 0) + minutes},
          streakDays: streak,
          lastActiveDate,
        });
        return {minutes, points: earned, streak};
      },

      // ---- Armario ----
      // Compra (si hace falta) y equipa/desequipa. Devuelve el resultado para la UI.
      purchaseOrToggle: item => {
        const s = get();
        const owned = s.unlockedItems.includes(item.id);

        if (!owned) {
          if (s.points < item.price) {
            return {ok: false, reason: 'insufficient', missing: item.price - s.points};
          }
          set({points: s.points - item.price, unlockedItems: [...s.unlockedItems, item.id]});
        }

        const key = item.category === 'hat' ? 'equippedHat' : 'equippedGlasses';
        const isEquipped = get()[key] === item.id;
        set({[key]: owned && isEquipped ? null : item.id});
        return {ok: true, bought: !owned, equipped: !(owned && isEquipped)};
      },

      resetAll: () => set({...initialState}),
    }),
    {
      name: 'user-store',
      storage: zustandStorage,
    },
  ),
);

export default useUserStore;
