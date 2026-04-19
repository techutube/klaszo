import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBBD2ebqEyxz8Q1XpHvRDz2xTos8XGEObI",
  authDomain: "klaszo.firebaseapp.com",
  projectId: "klaszo",
  storageBucket: "klaszo.firebasestorage.app",
  messagingSenderId: "432128821546",
  appId: "1:432128821546:web:436aa3c4c160292f9a3653",
  measurementId: "G-3WC7MBX5CX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
