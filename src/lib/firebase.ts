import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkBX6UqgQuGYzHpkjUjT9UwuEdAGKZ7QU",
  authDomain: "butchertrack-mobile.firebaseapp.com",
  projectId: "butchertrack-mobile",
  storageBucket: "butchertrack-mobile.appspot.com",
  messagingSenderId: "877997229124",
  appId: "1:877997229124:web:2f74cea527e247591ba811"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

if (typeof window !== 'undefined') {
    try {
        enableIndexedDbPersistence(db);
    } catch (err: any) {
        if (err.code === 'failed-precondition') {
            console.warn('Firebase persistence failed: multiple tabs open.');
        } else if (err.code === 'unimplemented') {
            console.warn('Firebase persistence failed: browser does not support it.');
        }
    }
}

export { app, auth, db };
