import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from './mmkv';
import {dateKey} from '../utils/date';

const useActivityStore = create(
  persist(
    (set, get) => ({
      activities: [],
      promptedGoals: {}, // { 'YYYY-MM-DD': ['id1', 'id2'] }

      addActivity: activity => set(s => ({activities: [...s.activities, activity]})),
      removeActivity: id => set(s => ({activities: s.activities.filter(a => a.id !== id)})),
      clearActivities: () => set({activities: [], promptedGoals: {}}),

      markGoalPrompted: (id, today = dateKey()) =>
        set(s => ({
          promptedGoals: {
            ...s.promptedGoals,
            [today]: [...(s.promptedGoals[today] || []), id],
          },
        })),
    }),
    {name: 'activity-store', storage: zustandStorage},
  ),
);

export default useActivityStore;
