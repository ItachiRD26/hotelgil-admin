import { initializeApp } from 'firebase/app';
import { initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { environment } from '../../environments/environment';

const firebaseConfig = {
  apiKey: environment.firebaseApiKey,
  authDomain: environment.firebaseAuthDomain,
  projectId: environment.firebaseProjectId,
  storageBucket: environment.firebaseStorageBucket,
  messagingSenderId: environment.firebaseMessagingSenderId,
  appId: environment.firebaseAppId,
  measurementId: environment.firebaseMeasurementId,
  databaseURL: environment.firebaseDatabaseURL,
};

export const app = initializeApp(firebaseConfig);

// ✅ Importante para Android/WebView: persistencia explícita
export const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence,
});

export const db = getDatabase(app);
