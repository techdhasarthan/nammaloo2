// Storage utilities for saving toilets and user preferences
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys
const STORAGE_KEYS = {
  SAVED_TOILETS: 'saved_toilets',
  USER_PREFERENCES: 'user_preferences'
};

// Saved toilets management
export const saveToilet = async (toilet, notes) => {
  try {
    const saved = await getSavedToilets();
    
    // Remove if already saved
    const filtered = saved.filter(item => item.toiletId !== toilet.uuid);
    
    // Add to saved
    const newSaved = {
      toiletId: toilet.uuid || toilet._id,
      name: toilet.name || 'Public Toilet',
      address: toilet.address || 'Address not available',
      rating: toilet.rating,
      savedAt: Date.now(),
      notes
    };
    
    const updated = [newSaved, ...filtered];
    
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEYS.SAVED_TOILETS, JSON.stringify(updated));
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_TOILETS, JSON.stringify(updated));
    }
  } catch (error) {
    console.error('Error saving toilet:', error);
  }
};

export const unsaveToilet = async (toiletId) => {
  try {
    const saved = await getSavedToilets();
    const filtered = saved.filter(item => item.toiletId !== toiletId);
    
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEYS.SAVED_TOILETS, JSON.stringify(filtered));
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_TOILETS, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error unsaving toilet:', error);
  }
};

export const getSavedToilets = async () => {
  try {
    let data;
    
    if (Platform.OS === 'web') {
      data = localStorage.getItem(STORAGE_KEYS.SAVED_TOILETS);
    } else {
      data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_TOILETS);
    }
    
    if (!data) return [];
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting saved toilets:', error);
    return [];
  }
};

export const isToiletSaved = async (toiletId) => {
  try {
    const saved = await getSavedToilets();
    return saved.some(item => item.toiletId === toiletId);
  } catch (error) {
    console.error('Error checking if toilet is saved:', error);
    return false;
  }
};

// User preferences
export const saveUserPreferences = async (preferences) => {
  try {
    const current = await getUserPreferences();
    const updated = { ...current, ...preferences };
    
    if (Platform.OS === 'web') {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
    }
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

export const getUserPreferences = async () => {
  try {
    let data;
    
    if (Platform.OS === 'web') {
      data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    } else {
      data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    }
    
    if (!data) {
      return {
        defaultRadius: 10,
        preferredFeatures: [],
        notifications: true,
        theme: 'auto'
      };
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return {
      defaultRadius: 10,
      preferredFeatures: [],
      notifications: true,
      theme: 'auto'
    };
  }
};