import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API base URL - change this to your actual backend URL
const API_BASE_URL = 'http://localhost:3000/api';

// Get auth token from storage
const getToken = async () => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('auth_token');
    } else {
      return await AsyncStorage.getItem('auth_token');
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Set auth token in storage
const setToken = async (token) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem('auth_token', token);
    } else {
      await AsyncStorage.setItem('auth_token', token);
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

// Remove auth token from storage
const removeToken = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('auth_token');
    } else {
      await AsyncStorage.removeItem('auth_token');
    }
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// API request helper
const apiRequest = async (endpoint, method = 'GET', data = null, requireAuth = false) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if required
    if (requireAuth) {
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const config = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };
    
    console.log(`🌐 API Request: ${method} ${url}`);
    
    const response = await fetch(url, config);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'API request failed');
    }
    
    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Toilet API functions
export const getToilets = async (userLocation) => {
  try {
    let endpoint = '/toilets';
    
    // Add location parameters if available
    if (userLocation) {
      endpoint += `?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
    }
    
    const response = await apiRequest(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching toilets:', error);
    return [];
  }
};

export const getToiletById = async (toiletId, userLocation) => {
  try {
    let endpoint = `/toilets/${toiletId}`;
    
    // Add location parameters if available
    if (userLocation) {
      endpoint += `?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
    }
    
    const response = await apiRequest(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching toilet ${toiletId}:`, error);
    return null;
  }
};

export const getTopRatedToilets = async (limit = 10, userLocation) => {
  try {
    let endpoint = `/toilets/top-rated?limit=${limit}`;
    
    // Add location parameters if available
    if (userLocation) {
      endpoint += `&lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
    }
    
    const response = await apiRequest(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching top rated toilets:', error);
    return [];
  }
};

export const getOpenToilets = async (userLocation) => {
  try {
    let endpoint = '/toilets/open';
    
    // Add location parameters if available
    if (userLocation) {
      endpoint += `?lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
    }
    
    const response = await apiRequest(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching open toilets:', error);
    return [];
  }
};

export const searchToilets = async (query, userLocation) => {
  try {
    let endpoint = `/toilets?search=${encodeURIComponent(query)}`;
    
    // Add location parameters if available
    if (userLocation) {
      endpoint += `&lat=${userLocation.latitude}&lng=${userLocation.longitude}`;
    }
    
    const response = await apiRequest(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error searching toilets:', error);
    return [];
  }
};

// Review API functions
export const getReviewsForToilet = async (toiletId) => {
  try {
    const response = await apiRequest(`/reviews/toilet/${toiletId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for toilet ${toiletId}:`, error);
    return [];
  }
};

export const createReview = async (toiletId, rating, reviewText) => {
  try {
    const response = await apiRequest(
      '/reviews',
      'POST',
      {
        toilet_id: toiletId,
        rating,
        review_text: reviewText
      },
      true
    );
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Report API functions
export const createReport = async (toiletId, issueText, issueType = 'other') => {
  try {
    const response = await apiRequest(
      '/reports',
      'POST',
      {
        toilet_id: toiletId,
        issue_text: issueText,
        issue_type: issueType
      },
      true
    );
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

// User API functions
export const registerUser = async (name, email, password) => {
  try {
    const response = await apiRequest(
      '/users/register',
      'POST',
      {
        name,
        email,
        password
      }
    );
    
    // Save token
    await setToken(response.data.token);
    
    return response.data.user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await apiRequest(
      '/users/login',
      'POST',
      {
        email,
        password
      }
    );
    
    // Save token
    await setToken(response.data.token);
    
    return response.data.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await removeToken();
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiRequest('/users/me', 'GET', null, true);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const createAnonymousUser = async () => {
  try {
    const response = await apiRequest('/users/anonymous', 'POST');
    
    // Save token
    await setToken(response.data.token);
    
    return response.data.user;
  } catch (error) {
    console.error('Error creating anonymous user:', error);
    throw error;
  }
};

// Test connection to API
export const testConnection = async () => {
  try {
    const response = await apiRequest('/health');
    
    return {
      success: true,
      details: response
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    return {
      success: false,
      error: error.message,
      details: { error: error.toString() }
    };
  }
};

// Export all functions
export default {
  getToilets,
  getToiletById,
  getTopRatedToilets,
  getOpenToilets,
  searchToilets,
  getReviewsForToilet,
  createReview,
  createReport,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  createAnonymousUser,
  testConnection
};