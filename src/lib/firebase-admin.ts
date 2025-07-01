import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors in hot-reloading environments.
if (!admin.apps.length) {
  admin.initializeApp({
    // Explicitly specifying the project ID can help in complex environments.
    projectId: 'butchertrack-mobile',
  });
}

// Get the firestore instance from the default initialized app.
export const adminDb = admin.firestore();
