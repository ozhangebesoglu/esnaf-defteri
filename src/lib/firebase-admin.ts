import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors in hot-reloading environments.
if (!admin.apps.length) {
  // Explicitly setting the projectId can resolve some initialization and authentication
  // issues in serverless environments.
  admin.initializeApp({
    projectId: 'butchertrack-mobile',
  });
}

// Get the firestore instance from the default initialized app.
export const adminDb = admin.firestore();
