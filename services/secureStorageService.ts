/**
 * Secure Storage Service
 * 
 * Provides encrypted storage for sensitive health data
 * All data is encrypted at rest using AES-256
 */

import { encryptionService } from './encryptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SecureStorageService {
  /**
   * Store data securely with encryption
   */
  async setItem(key: string, value: any): Promise<void> {
    try {
      await encryptionService.encryptAndStore(`secure_${key}`, value);
    } catch (error) {
      console.error(`Failed to securely store ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt data
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      return await encryptionService.retrieveAndDecrypt<T>(`secure_${key}`);
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove encrypted data
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`secure_${key}`);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all secure storage
   */
  async clear(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const secureKeys = allKeys.filter(key => key.startsWith('secure_'));
      await AsyncStorage.multiRemove(secureKeys);
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
      throw error;
    }
  }
}

export const secureStorage = new SecureStorageService();
