import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { authService } from '../services/auth.service';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'passenger' | 'admin') => Promise<void>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<void>;
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

  const logout = async () => {
    setIsLoading(true);
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isLoading, login, register, logout }}>
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
