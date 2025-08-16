import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDVaLtgLvlqONPjTPS8AHAL4cSWt4f_mPs",
  authDomain: "expenses-manager-4fa42.firebaseapp.com",
  projectId: "expenses-manager-4fa42",
  storageBucket: "expenses-manager-4fa42.firebasestorage.app",
  messagingSenderId: "62026403833",
  appId: "1:62026403833:web:b74578286d926e5275b728",
  measurementId: "G-22EP4T40HS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence');
  }
});

export default app;