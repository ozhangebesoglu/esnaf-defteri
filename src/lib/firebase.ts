import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// --- START: Hardcoded Firebase Configuration ---
// This is a temporary solution to a persistent environment issue.
// Ideally, these values should come from a .env file. However, it seems
// the Next.js server is not picking up .env file changes, which
// usually requires a server restart. To get you unblocked immediately,
// the configuration is placed directly here.

const firebaseConfig = {
  apiKey: "AIzaSyBMDoglKQ_qbCO1s0DeUm_J2jTFOQ5DeFA",
  authDomain: "merhabaapp-14bd8.firebaseapp.com",
  projectId: "merhabaapp-14bd8",
  storageBucket: "merhabaapp-14bd8.appspot.com",
  messagingSenderId: "432273595838",
  appId: "1:432273595838:web:8e530c3808142ba533edef"
};
// --- END: Hardcoded Firebase Configuration ---


// This logic prevents re-initializing the app on every hot-reload.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export default app;
