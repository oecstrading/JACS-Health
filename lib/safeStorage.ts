/**
 * Safe Storage Wrapper
 * 
 * Prevents AsyncStorage access during server-side rendering (SSR) or build time.
 * Returns null/empty values during SSR, actual values in client environment.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const isClient = typeof window !== 'undefined';

export const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    if (!isClient) {
      return null;
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (!isClient) {
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (!isClient) {
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    if (!isClient) {
      return;
    }
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  async getAllKeys(): Promise<readonly string[]> {
    if (!isClient) {
      return [];
    }
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    if (!isClient) {
      return;
    }
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
    }
  },
};
