import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {zustandStorage} from './mmkv';

const useEvidenceStore = create(
  persist(
    set => ({
      evidences: [],

      addEvidence: ({goalId = null, goalName = 'General', imageUri, note = ''}) =>
        set(s => ({
          evidences: [
            {
              id: Date.now().toString(),
              goalId,
              goalName: goalName || 'General',
              imageUri,
              note: note.trim(),
              createdAt: Date.now(),
            },
            ...s.evidences,
          ],
        })),

      removeEvidence: id =>
        set(s => ({
          evidences: s.evidences.filter(e => e.id !== id),
        })),

      clearEvidences: () => set({evidences: []}),
    }),
    {
      name: 'evidence-store',
      storage: zustandStorage,
    },
  ),
);

export default useEvidenceStore;
