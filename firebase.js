import { initializeApp, getApp, getApps } from "firebase/app";
// --- UPDATED: Import functions for persistent authentication ---
import {
    initializeAuth,
    getReactNativePersistence
} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
// --- Import the package you just installed ---
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAgYIVnIv4MPl2LXlFgM5OBhQjptF_kCs8",
    authDomain: "qrscanner-98823.firebaseapp.com",
    projectId: "qrscanner-98823",
    storageBucket: "qrscanner-98823.firebasestorage.app",
    messagingSenderId: "194872687531",
    appId: "1:194872687531:web:61a494c406d1c4629530ee",
    measurementId: "G-36JEP8YK6H"
};

// --- Robust Firebase Initialization ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- Initialize Services with Persistence ---
// This line is the critical change. It tells Firebase Auth to use
// AsyncStorage to save the user's login state.
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

// --- Conditionally Initialize Analytics ---
let analytics;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

// --- Export the services you need ---
export { app, auth, db, analytics };
