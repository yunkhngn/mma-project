import admin from 'firebase-admin';
import config from './index.js';

let firebaseApp;

if (config.firebase.serviceAccount) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(config.firebase.serviceAccount),
  });
  console.log('✅ Firebase Admin initialized');
} else {
  console.warn('⚠️  Firebase service account not configured — skipping init');
}

export { admin, firebaseApp };
