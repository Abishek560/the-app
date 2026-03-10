/**
 * Firebase initialization. Loaded as ES module; exposes app and auth on window for the rest of the app.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  fetchSignInMethodsForEmail
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBjT8BxyCpN2ugIKGElgJzzLz9Mn4Lg3go",
  authDomain: "the-app-32d6c.firebaseapp.com",
  projectId: "the-app-32d6c",
  storageBucket: "the-app-32d6c.firebasestorage.app",
  messagingSenderId: "1097698756753",
  appId: "1:1097698756753:web:d8abd9efd416bf2f961730"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

if (typeof window !== "undefined") {
  window.firebaseApp = app;
  window.firebaseAuth = auth;
  window.firebaseDb = db;
  window.firebaseDbRef = ref;
  window.firebaseDbSet = set;
  window.firebaseDbGet = get;
  window.firebaseAuthSignIn = signInWithEmailAndPassword;
  window.firebaseAuthSignUp = createUserWithEmailAndPassword;
  window.firebaseFetchSignInMethodsForEmail = fetchSignInMethodsForEmail;
  window.firebaseAuthSignOut = signOut;
  window.firebaseAuthUpdateProfile = updateProfile;
  window.firebaseAuthOnStateChanged = onAuthStateChanged;
  window.firebaseReady = Promise.resolve(app);
  window.getFirebaseIdToken = function () {
    var u = auth.currentUser;
    return u ? u.getIdToken() : Promise.resolve(null);
  };
}

export { app, auth, db, ref, set, get, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged, fetchSignInMethodsForEmail };
