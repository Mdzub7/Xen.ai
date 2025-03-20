import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; 
import { getStorage } from "firebase/storage";

// Validate env variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

requiredEnvVars.forEach(varName => {
  if (!import.meta.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
  }
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


setPersistence(auth,browserSessionPersistence).then(()=>{
console.log("session persistance");
}).catch((error)=>{
  console.log(error);
})

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Email & Password Login
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Email login error:", error);
    throw error;
  }
};

// Email & Password Signup
export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Email signup error:", error);
    throw error;
  }
};

// Google Login
export const loginWithGoogle = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

// GitHub Login
export const loginWithGithub = async (): Promise<UserCredential> => {
  try {
    return await signInWithPopup(auth, githubProvider);
  } catch (error) {
    console.error("GitHub login error:", error);
    throw error;
  }
};

export const logOut = async (): Promise<void> => {
  try {
    // Clear local storage and session
    localStorage.removeItem("user");
    sessionStorage.clear();

    // Firebase sign out
    await signOut(auth);

  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const sendResetEmail = async (auth: any, email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};