import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, browserLocalPersistence, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Init Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Init Auth — use AsyncStorage persistence on native, browser localStorage on web
const auth = Platform.OS === 'web'
  ? initializeAuth(app, { persistence: browserLocalPersistence })
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

// Init Firestore
const db = getFirestore(app);

export { app, auth, db };
