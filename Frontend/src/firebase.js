
import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "task-tracker-57e11.firebaseapp.com",
  projectId: "task-tracker-57e11",
  storageBucket: "task-tracker-57e11.firebasestorage.app",
  messagingSenderId: "189026259158",
  appId: "1:189026259158:web:c89a6db3f496d08009f977",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
