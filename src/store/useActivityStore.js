import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from './mmkv';

const useActivityStore = create(
  persist(
    set => ({
      activities: [],
      addActivity: activity => set(s => ({activities: [...s.activities, activity]})),
      removeActivity: id => set(s => ({activities: s.activities.filter(a => a.id !== id)})),
      clearActivities: () => set({activities: []}),
    }),
    {name: 'activity-store', storage: zustandStorage},
  ),
);

export default useActivityStore;
