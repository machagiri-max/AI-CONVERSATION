// Import the functions you need
import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAAC4Da2KmXBMea3kNteTKWD6gYJaDr3ZE",
  authDomain: "ai-assistant-4ab68.firebaseapp.com",
  projectId: "ai-assistant-4ab68",
  storageBucket: "ai-assistant-4ab68.firebasestorage.app",
  messagingSenderId: "524767265921",
  appId: "1:524767265921:web:abee4518aa735e90baf980",
  measurementId: "G-1DRRY5NG21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

// ADD THIS
export const auth = getAuth(app);