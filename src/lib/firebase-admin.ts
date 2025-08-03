import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors in hot-reloading environments.
if (!admin.apps.length) {
  // For development, we can use the default credentials
  // In production, you should use a service account key
  admin.initializeApp({
    projectId: 'butchertrack-mobile',
    // If you have a service account key file, uncomment and use this:
    // credential: admin.credential.cert(require('./serviceAccountKey.json')),
  });
}

// Get the firestore instance from the default initialized app.
export const adminDb = admin.firestore();
