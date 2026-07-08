import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSq-tovVsQMtnaA3KwrT1wExTAc86zyXw",
  authDomain: "chateau-dif-pondy-websit-948d4.firebaseapp.com",
  projectId: "chateau-dif-pondy-websit-948d4",
  storageBucket: "chateau-dif-pondy-websit-948d4.firebasestorage.app",
  messagingSenderId: "585557676129",
  appId: "1:585557676129:web:b9d5dd7f116fcfc7875a20"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Exports
export { auth, db, provider };

// Authentication helper functions (keep auth modular here)
export async function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export async function signOutUser() {
  return signOut(auth);
}

export function onAuthStateChangedListener(cb) {
  return onAuthStateChanged(auth, cb);
}
