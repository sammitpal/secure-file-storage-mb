import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cross-platform secure storage that works on web and mobile
 * Uses SecureStore on mobile and AsyncStorage on web
 */

const isWeb = Platform.OS === 'web';

export const secureStorage = {
  async setItem(key, value) {
    try {
      if (isWeb) {
        // Use AsyncStorage for web (less secure but functional)
        await AsyncStorage.setItem(key, value);
      } else {
        // Use SecureStore for mobile (more secure)
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  },

  async getItem(key) {
    try {
      if (isWeb) {
        // Use AsyncStorage for web
        return await AsyncStorage.getItem(key);
      } else {
        // Use SecureStore for mobile
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  },

  async removeItem(key) {
    try {
      if (isWeb) {
        // Use AsyncStorage for web
        await AsyncStorage.removeItem(key);
      } else {
        // Use SecureStore for mobile
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  },

  async clear() {
    try {
      if (isWeb) {
        // Clear all AsyncStorage for web
        await AsyncStorage.clear();
      } else {
        // For SecureStore, we need to remove items individually
        // This is a simplified version - in production you'd track keys
        const keys = ['authToken', 'refreshToken', 'currentUser', 'themePreference'];
        await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key).catch(() => {})));
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
};

export default secureStorage; 