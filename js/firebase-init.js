/**
 * Firebase initialization. Database only (no Auth). Email + portalName stored in localStorage.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
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
const db = getDatabase(app);

if (typeof window !== "undefined") {
  window.firebaseApp = app;
  window.firebaseDb = db;
  window.firebaseDbRef = ref;
  window.firebaseDbSet = set;
  window.firebaseDbGet = get;
  window.firebaseReady = Promise.resolve(app);
}

export { app, db, ref, set, get };
