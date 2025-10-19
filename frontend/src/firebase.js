// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIrCIm5TSIaSKNRezO4-8CLvSHQeUh-60",
  authDomain: "recipe-genie-9d607.firebaseapp.com",
  projectId: "recipe-genie-9d607",
  storageBucket: "recipe-genie-9d607.appspot.com",
  messagingSenderId: "1060099835136",
  appId: "1:1060099835136:web:d704808259b54526401fe5",
  measurementId: "G-71TPKYY8Y4",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ✅ Set persistence (if you need it)
// Remove this line if you don't specifically need persistence
// setPersistence(auth, browserLocalPersistence)
//   .then(() => {
//     console.log("Auth persistence set to local");
//   })
//   .catch((error) => {
//     console.error("Error setting auth persistence:", error);
//   });

// ✅ Auth context (for global user state)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
