// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoUf-A2e5rx5d4ytfBsjQ9bAj1x8vYTQ0",
  authDomain: "activity-tracker-app-7da91.firebaseapp.com",
  projectId: "activity-tracker-app-7da91",
  storageBucket: "activity-tracker-app-7da91.firebasestorage.app",
  messagingSenderId: "649026954577",
  appId: "1:649026954577:web:6cd2906e766c14f568df70",
};

// Initialize Firebase — guarded against re-initializing on Fast Refresh,
// which otherwise throws "Firebase App named '[DEFAULT]' already exists".
export const FIREBASE_APP = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// initializeAuth can only be called once per app — on Fast Refresh this
// module re-runs while the app is still around, so fall back to getAuth.
let auth;
try {
  auth = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  auth = getAuth(FIREBASE_APP);
}
export const FIREBASE_AUTH = auth;

export const FIREBASE_DB = getFirestore(FIREBASE_APP);
