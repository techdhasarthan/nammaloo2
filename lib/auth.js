import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_STORAGE_KEY = 'user_auth_data';

// Securely store user data
export const storeUserData = async (userData) => {
  try {
    const data = JSON.stringify(userData);
    if (Platform.OS === 'web') {
      localStorage.setItem(AUTH_STORAGE_KEY, data);
    } else {
      await SecureStore.setItemAsync(AUTH_STORAGE_KEY, data);
    }
  } catch (error) {
    console.error('Store user data error:', error);
  }
};

// Retrieve stored user
export const getStoredUserData = async () => {
  try {
    let data;
    if (Platform.OS === 'web') {
      data = localStorage.getItem(AUTH_STORAGE_KEY);
    } else {
      data = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
    }
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Retrieve user data error:', error);
    return null;
  }
};

// Clear user session
export const clearUserData = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Clear user data error:', error);
  }
};

// Is user authenticated?
export const isAuthenticated = async () => {
  const user = await getStoredUserData();
  return user && (user.accessToken || user.isGuest);
};