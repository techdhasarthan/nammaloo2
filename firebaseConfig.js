import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };
