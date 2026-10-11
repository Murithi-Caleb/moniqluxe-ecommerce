import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function getFirebaseServices() {
  if (typeof window === "undefined") {
    return { app: null, auth: null, db: null, storage: null, error: null };
  }

  const requiredConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const missingConfig = Object.entries(requiredConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingConfig.length > 0) {
    const hasAnyConfig = Object.values(requiredConfig).some(Boolean);
    return {
      app: null,
      auth: null,
      db: null,
      storage: null,
      error: hasAnyConfig
        ? new Error(
            `Missing Firebase client configuration: ${missingConfig.join(", ")}`,
          )
        : null,
    };
  }

  const config = {
    ...requiredConfig,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
  };
  const app = getApps().length > 0 ? getApp() : initializeApp(config);

  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
    error: null,
  };
}

export const { app, auth, db, storage, error: firebaseConfigError } =
  getFirebaseServices();
