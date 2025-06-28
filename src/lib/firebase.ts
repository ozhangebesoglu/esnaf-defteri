import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

export { app, auth, db };
