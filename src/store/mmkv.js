import {MMKV} from 'react-native-mmkv';
import {createJSONStorage} from 'zustand/middleware';

export const storage = new MMKV({id: 'neuron-storage'});

const mmkvAdapter = {
  setItem: (name, value) => storage.set(name, value),
  getItem: name => storage.getString(name) ?? null,
  removeItem: name => storage.delete(name),
};

export const zustandStorage = createJSONStorage(() => mmkvAdapter);
