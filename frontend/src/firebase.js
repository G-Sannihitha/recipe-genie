// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
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

// ✅ Auth context (for global user state)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
