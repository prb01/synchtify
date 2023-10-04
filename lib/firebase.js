import { initializeApp } from 'firebase/app';
import "firebase/auth";
import "firebase/firestore"
import "firebase/app-check";

const firebaseKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

const options = {
  apiKey: firebaseKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
};

const app = initializeApp(options);

export default app;