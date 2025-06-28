import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMDoglKQ_qbCO1s0DeUm_J2jTFOQ5DeFA",
  authDomain: "merhabaapp-14bd8.firebaseapp.com",
  projectId: "merhabaapp-14bd8",
  storageBucket: "merhabaapp-14bd8.appspot.com",
  messagingSenderId: "432273595838",
  appId: "1:432273595838:web:8e530c3808142ba533edef"
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
