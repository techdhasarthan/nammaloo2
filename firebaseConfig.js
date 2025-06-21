import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, browserLocalPersistence } from 'firebase/auth';
import { Platform } from 'react-native';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCdbg3Elh2UpEhhDYw5iPCG57yiXd3TFjU',
  authDomain: 'nammalo.firebaseapp.com',
  projectId: 'nammalo',
  storageBucket: 'nammalo.firebasestorage.app',
  messagingSenderId: '593526655726',
  appId: '1:593526655726:web:941ddeab7d1f1db753c1ff',
  measurementId: 'G-YZ5FRZ72PF',
};

const app = initializeApp(firebaseConfig);

let auth;

if (Platform.OS === 'web') {
  // For web platform, use the default auth instance with browser persistence
  auth = getAuth(app);
} else {
  // For React Native platforms, use AsyncStorage persistence
  const { getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };