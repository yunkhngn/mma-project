import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { authService } from '../services/auth';
import { userService } from '../services/user';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Sync user details to local database
          const syncedUser = await authService.syncUser();
          setUser(syncedUser);
        } catch (error) {
          console.error('Failed to sync user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string, fullName: string, phone: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 1. Set displayName in Firebase Auth
      if (userCredential.user) {
        await updateFirebaseProfile(userCredential.user, { displayName: fullName });
      }
      
      // 2. Sync to Backend database
      await authService.syncUser();
      
      // 3. Update additional fields (fullName, phone) in Backend SQL DB
      const updatedUser = await userService.updateProfile(fullName, phone);
      setUser(updatedUser);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    setLoading(true);
    try {
      if (idToken === "MOCK_GOOGLE_ID_TOKEN") {
        // Mock Google Login using a Firebase test account for seamless local development
        const mockEmail = "google-mock-user@viettrip.com";
        const mockPassword = "GoogleMockPassword123!";
        try {
          await signInWithEmailAndPassword(auth, mockEmail, mockPassword);
        } catch (signInError: any) {
          // Firebase v10/v11 may throw 'auth/invalid-credential' or 'auth/user-not-found'
          if (
            signInError.code === 'auth/user-not-found' || 
            signInError.code === 'auth/invalid-credential' || 
            String(signInError.message).includes('invalid-credential') ||
            String(signInError.message).includes('user-not-found')
          ) {
            try {
              const userCredential = await createUserWithEmailAndPassword(auth, mockEmail, mockPassword);
              if (userCredential.user) {
                await updateFirebaseProfile(userCredential.user, { displayName: "Google Mock User" });
              }
            } catch (createError) {
              // If creation fails because user already exists (invalid-credential check was false positive), retry sign in
              await signInWithEmailAndPassword(auth, mockEmail, mockPassword);
            }
          } else {
            throw signInError;
          }
        }
      } else {
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
