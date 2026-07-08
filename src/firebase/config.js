// Firebase Configuration
// Replace these placeholder values with your actual Firebase project credentials
// when connecting real hardware. The app works with mock data without Firebase.

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBDqPBsL-qp26Dj7yMJyHVnmsOA6ccMMbk",
  authDomain: "coldchainmonitor-5cd30.firebaseapp.com",
  databaseURL: "https://coldchainmonitor-5cd30-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "coldchainmonitor-5cd30",
  storageBucket: "coldchainmonitor-5cd30.firebasestorage.app",
  messagingSenderId: "419642973525",
  appId: "1:419642973525:web:be229b665a9bf2606b63dc"
};

let app = null;
let db = null;
let auth = null;

try {
  const isPlaceholder = Object.values(firebaseConfig).some(
    val => typeof val === 'string' && (val.includes('YOUR_') || val.includes('placeholder'))
  );

  if (isPlaceholder) {
    console.warn('Firebase initialization skipped — config contains placeholder credentials (YOUR_PROJECT). Please update src/firebase/config.js with your project credentials.');
  } else {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    auth = getAuth(app);
  }
} catch (err) {
  console.warn('Firebase initialization error:', err.message);
}

export { app, db, auth };
export default firebaseConfig;
