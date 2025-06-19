import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_STORAGE_KEY = 'user_auth_data';

// Google OAuth configuration
const googleConfig = {
  clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  scopes: ['openid', 'profile', 'email'],
  additionalParameters: {},
  customParameters: {},
};

// Create auth request for Google
export const createGoogleAuthRequest = () => {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'nammaloo',
    path: 'auth',
  });

  return AuthSession.useAuthRequest(
    {
      clientId: googleConfig.clientId,
      scopes: googleConfig.scopes,
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      extraParams: {
        access_type: 'offline',
      },
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    }
  );
};

// Exchange authorization code for access token
export const exchangeCodeForToken = async (code, redirectUri) => {
  try {
    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: googleConfig.clientId,
        clientSecret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET,
        code,
        redirectUri,
        extraParams: {
          grant_type: 'authorization_code',
        },
      },
      {
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      }
    );

    return tokenResponse;
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
};

// Get user info from Google
export const getUserInfo = async (accessToken) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error('Get user info error:', error);
    throw error;
  }
};

// Store user data securely
export const storeUserData = async (userData) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } else {
      await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(userData));
    }
  } catch (error) {
    console.error('Store user data error:', error);
    throw error;
  }
};

// Get stored user data
export const getStoredUserData = async () => {
  try {
    let userData;
    if (Platform.OS === 'web') {
      userData = localStorage.getItem(AUTH_STORAGE_KEY);
    } else {
      userData = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
    }
    
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Get stored user data error:', error);
    return null;
  }
};

// Clear stored user data
export const clearUserData = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Clear user data error:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const userData = await getStoredUserData();
  return userData && userData.accessToken;
};