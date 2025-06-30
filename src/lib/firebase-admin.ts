import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors in hot-reloading environments.
if (!admin.apps.length) {
  admin.initializeApp({
    // Let the App Hosting environment provide credentials and configuration automatically.
  });
}

// Get the firestore instance from the default initialized app.
export const adminDb = admin.firestore();
