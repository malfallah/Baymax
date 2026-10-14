import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

/** Async key/value storage backed by AsyncStorage (localStorage on web). */
export const jsonStorage = createJSONStorage(() => AsyncStorage);

/** Encrypted storage for secrets on iOS/Android; falls back to AsyncStorage on web. */
const secureStateStorage: StateStorage = {
  getItem: (key) =>
    Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key),
  setItem: (key, value) =>
    Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value),
  removeItem: (key) =>
    Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
};

export const secureJsonStorage = createJSONStorage(() => secureStateStorage);
