import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- New Imports for Auth Persistence ---
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAgYIVnIv4MPl2LXlFgM5OBhQjptF_kCs8",
    authDomain: "qrscanner-98823.firebaseapp.com",
    projectId: "qrscanner-98823",
    storageBucket: "qrscanner-98823.firebasestorage.app",
    messagingSenderId: "194872687531",
    appId: "1:194872687531:web:61a494c406d1c4629530ee",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// --- Initialize Firestore ---
export const db = getFirestore(app);

// --- Initialize Auth with Persistence ---
// This will store the user's login state securely on the device.
// Make sure you have installed the required package:
// npx expo install @react-native-async-storage/async-storage
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
