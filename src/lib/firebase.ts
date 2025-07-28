
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "omniride-rbjrs",
  "appId": "1:1004086661642:web:6bcdad7ff7a478b0ad45f3",
  "storageBucket": "omniride-rbjrs.firebasestorage.app",
  "apiKey": "AIzaSyAeOo357uG1St07_SSDs5L_Olx_qlkSQ0Y",
  "authDomain": "omniride-rbjrs.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1004086661642"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
try {
    if (typeof window !== 'undefined') {
        enableIndexedDbPersistence(db);
    }
} catch (err: any) {
    if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one.
        console.warn('Firestore persistence failed: multiple tabs open.');
    } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        console.warn('Firestore persistence not available in this browser.');
    }
}


export { app, auth, db };
