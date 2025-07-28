
"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot, DocumentData } from "firebase/firestore";
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
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        
        let userDocRef;
        // Check if the user authenticated with a phone number
        if (user.providerData.some(p => p.providerId === 'phone')) {
            // For phone auth, we might not have a user doc yet.
            // Or, we might need a different way to look up the user,
            // e.g., by phone number if we stored it.
            // For now, let's assume we create a doc with their UID.
             userDocRef = doc(db, "users", user.uid);
        } else {
            userDocRef = doc(db, "users", user.uid);
        }

        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // This could be a new user via phone auth.
            // We can create a profile or handle as needed.
            if(user.phoneNumber) {
                setUserProfile({ phone: user.phoneNumber });
            } else {
                setUserProfile(null);
            }
          }
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
