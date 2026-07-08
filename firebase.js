import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
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

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
