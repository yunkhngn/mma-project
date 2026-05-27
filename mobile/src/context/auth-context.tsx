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
          // Default to sync state with backend.
          // This will run once when any sign-in flow completes successfully.
          console.log('Firebase auth state changed: User logged in. Syncing profile...');
          const profile = await authService.syncUser();
          setUser(profile);
        } catch (error) {
          console.error('Failed to sync user state in listener:', error);
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
      console.log(`Starting sign-in for email: ${email} as role: ${role}`);
      await signInWithEmailAndPassword(auth, email, password);
      
      // If the user logging in is an admin, we perform administrative validation
      if (role === 'admin') {
        console.log('Admin login detected. Verifying permission with backend...');
        const profile = await authService.adminLogin();
        setUser(profile);
      }
    } catch (error) {
      console.error('Sign-in error:', error);
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
      console.log(`Starting registration for: ${email}`);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (credential.user) {
        console.log('Firebase user created. Updating profile display name...');
        await updateProfile(credential.user, { displayName: fullName });
      }
    } catch (error) {
      console.error('Registration error:', error);
      await signOut(auth);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        console.log('Initiating Firebase Google Sign-In popup on Web...');
        await signInWithPopup(auth, provider);
      } else {
        // For Native (Expo Go / Emulator) where Google SDK is not configured:
        // We simulate Google login using a test account (google-test@mma.com)
        // so that the entire backend sync & dashboard flow can be verified.
        const testEmail = 'google-test@mma.com';
        const testPass = 'googleTestPassword123!';
        console.log('Simulating Google Sign-In on Native using fallback...');
        try {
          await signInWithEmailAndPassword(auth, testEmail, testPass);
        } catch (e: any) {
          if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential' || e.code === 'auth/invalid-email') {
            console.log('Fallback user not found. Creating a new test account...');
            const credential = await createUserWithEmailAndPassword(auth, testEmail, testPass);
            if (credential.user) {
              await updateProfile(credential.user, { displayName: 'Google Test User' });
            }
          } else {
            throw e;
          }
        }
      }
    } catch (error: any) {
      // User closed the popup — stay on login screen silently
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('Google Sign-In error:', error);
      await signOut(auth);
      setUser(null);
      throw error;
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
