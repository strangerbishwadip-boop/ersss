/**
 * Firebase Configuration
 * 
 * Reads credentials from environment variables (.env file).
 * If no env vars are set, the app runs in offline mock mode.
 * 
 * ⚠️ NEVER hardcode API keys in source code.
 *    Always use .env files (which are in .gitignore).
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     || '',
};

/** Returns true if Firebase credentials are present */
export const isFirebaseEnabled = (): boolean => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseEnabled()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log('🔥 Firebase connected — Project:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('⚠️ Firebase init failed, running in offline mode:', err);
  }
} else {
  console.log('📦 No Firebase credentials found — running in offline mock mode');
}

export { app, db, auth, storage };
