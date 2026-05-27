import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Platform } from 'react-native';
import { auth } from '../services/firebase';
import { authService } from '../services/auth.service';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'passenger' | 'admin') => Promise<void>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          // Default to sync as passenger first to resolve details
          const profile = await authService.syncUser();
          setUser(profile);
        } catch (error) {
          console.error('Failed to sync user state:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string, role: 'passenger' | 'admin') => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      let profile: User;
      if (role === 'admin') {
        profile = await authService.adminLogin();
      } else {
        profile = await authService.syncUser();
      }
      setUser(profile);
    } catch (error) {
      await signOut(auth);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, phone: string, password: string) => {
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (credential.user) {
        await updateProfile(credential.user, { displayName: fullName });
      }
      // Force sync with backend (backend sets role: 'passenger')
      const profile = await authService.syncUser();
      setUser(profile);
    } catch (error) {
      await signOut(auth);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        console.log('Firebase Auth instance:', auth);
        console.log('Google Auth Provider instance:', provider);
        await signInWithPopup(auth, provider);
      } else {
        // For Native (Expo Go / Emulator) where Google SDK is not configured:
        // We simulate Google login using a test account (google-test@mma.com)
        // so that the entire backend sync & dashboard flow can be verified.
        const testEmail = 'google-test@mma.com';
        const testPass = 'googleTestPassword123!';
        try {
          await signInWithEmailAndPassword(auth, testEmail, testPass);
        } catch (e: any) {
          if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential' || e.code === 'auth/invalid-email') {
            // If doesn't exist, create it so they have a fresh account
            const credential = await createUserWithEmailAndPassword(auth, testEmail, testPass);
            if (credential.user) {
              await updateProfile(credential.user, { displayName: 'Google Test User' });
            }
          } else {
            throw e;
          }
        }
      }
      const profile = await authService.syncUser();
      setUser(profile);
    } catch (error) {
      await signOut(auth);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isLoading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
