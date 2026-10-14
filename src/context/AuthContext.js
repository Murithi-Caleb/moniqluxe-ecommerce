"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return undefined;
    }

    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      },
      (error) => {
        console.error("Unable to observe Firebase Authentication state.", error);
        setIsLoading(false);
      },
    );
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!auth) {
      throw new Error("Firebase Authentication is not configured.");
    }

    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (name, email, password) => {
    if (!auth) {
      throw new Error("Firebase Authentication is not configured.");
    }

    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await updateProfile(credential.user, { displayName: name });
    return credential;
  }, []);

  const resetPassword = useCallback(async (email) => {
    if (!auth) {
      throw new Error("Firebase Authentication is not configured.");
    }

    return sendPasswordResetEmail(auth, email);
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) {
      throw new Error("Firebase Authentication is not configured.");
    }

    return firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signUp, resetPassword, signOut }),
    [user, isLoading, signIn, signUp, resetPassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
