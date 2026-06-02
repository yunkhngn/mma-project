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
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
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
