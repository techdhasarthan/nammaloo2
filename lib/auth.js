import * as AuthSession from 'expo-auth-session';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_STORAGE_KEY = 'user_auth_data';

// Google OAuth config (from .env)
const googleConfig = {
  clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  clientSecret: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET,
  scopes: ['openid', 'profile', 'email'],
};

// Use Expo proxy redirect (for Expo Go)
const getRedirectUri = () =>
  AuthSession.makeRedirectUri({
    useProxy: true,
  });

// Create auth request
// export const createGoogleAuthRequest = () => {
//   const redirectUri = AuthSession.makeRedirectUri({
//     useProxy: true,
//   });
//   return AuthSession.useAuthRequest(
//     {
//       clientId: googleConfig.clientId,
//       scopes: googleConfig.scopes,
//       redirectUri,
//       responseType: AuthSession.ResponseType.Code,
//       extraParams: {
//         access_type: 'offline',
//       },
//     },
//     {
//       authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
//       tokenEndpoint: 'https://oauth2.googleapis.com/token',
//     }
//   );
// };

const clientId =
  '887139635114-8536innqmtah8cl8nisufev0qo3g5l6p.apps.googleusercontent.com';

export const createGoogleAuthRequest = () => {
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

  console.log('Creating Google Auth Request with clientId:', clientId);
  console.log('Redirect URI:', redirectUri); // Should log: https://auth.expo.io/@username/app-slug

  return AuthSession.useAuthRequest(
    {
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri, // ✅ using the same one
      responseType: 'token',
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    }
  );
};

// Exchange code for token
// export const exchangeCodeForToken = async (code) => {
//   const redirectUri = AuthSession.makeRedirectUri({
//     useProxy: true,
//   });

//   try {
//     const tokenResponse = await AuthSession.exchangeCodeAsync(
//       {
//         clientId: googleConfig.clientId,
//         clientSecret: googleConfig.clientSecret,
//         code,
//         redirectUri,
//         extraParams: {
//           grant_type: 'authorization_code',
//         },
//       },
//       {
//         tokenEndpoint: 'https://oauth2.googleapis.com/token',
//       }
//     );

//     return tokenResponse;
//   } catch (error) {
//     console.error('Token exchange error:', error);
//     throw error;
//   }
// };
export const exchangeCodeForToken = async (code, redirectUri) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
      client_secret: 'YOUR_GOOGLE_CLIENT_SECRET',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to exchange token');
  }
  return data;
};

// Get user info from Google
// export const getUserInfo = async (accessToken) => {
//   try {
//     const res = await fetch(
//       `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
//     );
//     return await res.json();
//   } catch (error) {
//     console.error('User info fetch error:', error);
//     throw error;
//   }
// };

export const getUserInfo = async (accessToken) => {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await res.json();
};

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
  return user && user.accessToken;
};
