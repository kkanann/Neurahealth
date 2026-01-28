
// CHANGE THIS FILE ACCORDING TO YOUR FIREBASE CONFIGURATION

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyCDqYbid6y7w7VDPeHGGWsKUWEHlLHeZY0",
  authDomain: "neurahealth-101.firebaseapp.com",
  projectId: "neurahealth-101",
  storageBucket: "neurahealth-101.firebasestorage.app",
  messagingSenderId: "647278547051",
  appId: "1:647278547051:web:ed5ceaa5a070c8bf5d212e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;


