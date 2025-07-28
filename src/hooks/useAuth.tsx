
"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot, DocumentData, Unsubscribe } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// Augment the Window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | DocumentData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: Unsubscribe | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      // Clean up previous profile listener if it exists
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }

      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);

        // Set up new profile listener
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // This case handles users who are authenticated (e.g. via phone) 
            // but may not have a user document in Firestore yet.
            setUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setUserProfile(null);
            setLoading(false);
        });
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Cleanup function for the auth listener
    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
