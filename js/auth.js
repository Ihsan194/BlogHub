import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { updateUI } from './ui.js';

const firebaseConfig = {
  apiKey: "AIzaSyAPj4q8YQEZqLiD1wQ6o89rrlG1wfKwK0k",
  authDomain: "blogging-website-28.firebaseapp.com",
  projectId: "blogging-website-28",
  storageBucket: "blogging-website-28.appspot.com",
  messagingSenderId: "954301775210",
  appId: "1:954301775210:web:27361c6b3baed47923b913",
  measurementId: "G-8LE7H1H0H2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function checkAuthState() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            updateUI(user);
            resolve(user);
        });
    });
}

export async function signIn(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return true;
    } catch (error) {
        console.error("Sign in error:", error);
        return false;
    }
}

export async function signUp(email, password) {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        return true;
    } catch (error) {
        console.error("Sign up error:", error);
        return false;
    }
}

export async function logout() {
    try {
        await signOut(auth);
        return true;
    } catch (error) {
        console.error("Logout error:", error);
        return false;
    }
}