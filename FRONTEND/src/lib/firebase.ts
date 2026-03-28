import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDJ4JBUgk12jjRx4peix3QLiITP5zKu26Q",
  authDomain: "worklink-new.firebaseapp.com",
  projectId: "worklink-new",
  storageBucket: "worklink-new.firebasestorage.app",
  messagingSenderId: "863025598683",
  appId: "1:863025598683:web:5426d2ef3e1096f9dc7cfe",
  measurementId: "G-TDLEJC8GSY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize persistence
setPersistence(auth, browserLocalPersistence)
  .catch((err) => console.error("Firebase persistence error:", err));

export const googleProvider = new GoogleAuthProvider();
