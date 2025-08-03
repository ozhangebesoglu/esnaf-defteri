import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkBX6UqgQuGYzHpkjUjT9UwuEdAGKZ7QU",
  authDomain: "butchertrack-mobile.firebaseapp.com",
  projectId: "butchertrack-mobile",
  storageBucket: "butchertrack-mobile.appspot.com",
  messagingSenderId: "877997229124",
  appId: "1:877997229124:web:2f74cea527e247591ba811"
};

// Initialize Firebase
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Initialize Auth
let auth;
try {
  auth = getAuth(app);
} catch (error) {
  console.error('Firebase Auth initialization error:', error);
  throw error;
}

// Initialize Firestore
let db;
try {
  db = getFirestore(app);
  
  // Enable offline persistence
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firebase persistence failed: multiple tabs open.');
      } else if (err.code === 'unimplemented') {
        console.warn('Firebase persistence failed: browser does not support it.');
      } else {
        console.error('Firebase persistence error:', err);
      }
    });
  }
} catch (error) {
  console.error('Firestore initialization error:', error);
  throw error;
}

export { app, auth, db };
