import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDJ3wqoyrgK5uvAAryl8-SzZDLpQZs2jsY",
  authDomain: "go-travel-india-d3bfd.firebaseapp.com",
  projectId: "go-travel-india-d3bfd",
  storageBucket: "go-travel-india-d3bfd.firebasestorage.app",
  messagingSenderId: "645158078752",
  appId: "1:645158078752:web:8763356a956d432d612f45",
  measurementId: "G-9ZL2ZVJQR4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword };
