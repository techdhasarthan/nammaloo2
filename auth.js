import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCdbg3Elh2UpEhhDYw5iPCG57yiXd3TFjU',
  authDomain: 'nammalo.firebaseapp.com',
  projectId: 'nammalo',
  storageBucket: 'nammalo.appspot.com',
  messagingSenderId: '593526655726',
  appId: '1:593526655726:web:941ddeab7d1f1db753c1ff',
  measurementId: 'G-YZ5FRZ72PF',
};

let auth;

export const getAuthInstance = () => {
  if (!auth) {
    const app = initializeApp(firebaseConfig);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  return auth;
};
