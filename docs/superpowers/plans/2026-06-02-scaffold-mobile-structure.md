# Scaffold Mobile Directory and Component Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the recommended folder layout and key boilerplate files (atoms, molecules, contexts, services, and feature domains) for the newly reinitialized mobile project.

**Architecture:** We will create folders for Atomic Design components under `components/`, define feature folders under `features/`, and initialize central api/firebase services, auth context, and basic UI primitives (Button, Typography, FormField) using standard React Native StyleSheets.

**Tech Stack:** React Native, Expo, TypeScript.

---

### Task 1: Create Folder Structure and Feature Entries

**Files:**
- Create: `mobile/features/auth/index.ts`
- Create: `mobile/features/bookings/index.ts`
- Create: `mobile/features/vehicles/index.ts`

- [ ] **Step 1: Create directory structures**
  Ensure all directories exist. You can create them implicitly by writing the entry files or running a mkdir command.
  Create directories:
  - `mobile/components/atoms`
  - `mobile/components/molecules`
  - `mobile/components/organisms`
  - `mobile/features/auth/components`
  - `mobile/features/auth/hooks`
  - `mobile/features/auth/services`
  - `mobile/features/auth/types`
  - `mobile/features/bookings/components`
  - `mobile/features/bookings/hooks`
  - `mobile/features/bookings/services`
  - `mobile/features/bookings/types`
  - `mobile/features/vehicles/components`
  - `mobile/features/vehicles/hooks`
  - `mobile/features/vehicles/services`
  - `mobile/features/vehicles/types`
  - `mobile/services`
  - `mobile/context`
  - `mobile/types`
  - `mobile/utils`

- [ ] **Step 2: Create feature exports**
  Create `mobile/features/auth/index.ts` as the public entrypoint for Auth.
  ```typescript
  // Public API for Auth feature
  // Export components, hooks, and services here when created
  export {};
  ```

  Create `mobile/features/bookings/index.ts` as the public entrypoint for Bookings.
  ```typescript
  // Public API for Bookings feature
  export {};
  ```

  Create `mobile/features/vehicles/index.ts` as the public entrypoint for Vehicles.
  ```typescript
  // Public API for Vehicles feature
  export {};
  ```

---

### Task 2: Create Global Services and Auth Context

**Files:**
- Create: `mobile/services/api.ts`
- Create: `mobile/services/firebase.ts`
- Create: `mobile/context/AuthContext.tsx`

- [ ] **Step 1: Create API Client boilerplate**
  Create `mobile/services/api.ts` configuring a base fetch/axios-like structure.
  ```typescript
  import Constants from 'expo-constants';

  const BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

  export const apiClient = {
    async get<T>(path: string, options?: RequestInit): Promise<T> {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });
      if (!response.ok) {
        throw new Error(`API GET request failed: ${response.statusText}`);
      }
      return response.json();
    },

    async post<T>(path: string, body: any, options?: RequestInit): Promise<T> {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: JSON.stringify(body),
        ...options,
      });
      if (!response.ok) {
        throw new Error(`API POST request failed: ${response.statusText}`);
      }
      return response.json();
    },
  };
  ```

- [ ] **Step 2: Create Firebase SDK client initialization placeholder**
  Create `mobile/services/firebase.ts`.
  ```typescript
  // Placeholder for Firebase initialization
  // In the future, import firebase/app and firebase/auth here.
  
  export const firebaseConfig = {
    apiKey: "MOCK_API_KEY",
    authDomain: "mma-project-35d07.firebaseapp.com",
    projectId: "mma-project-35d07",
    storageBucket: "mma-project-35d07.firebasestorage.app",
    messagingSenderId: "624050076746",
    appId: "1:624050076746:web:example"
  };

  export const initializeFirebase = () => {
    console.log("Firebase initialized with configuration.");
  };
  ```

- [ ] **Step 3: Create Auth Context and Provider**
  Create `mobile/context/AuthContext.tsx`.
  ```typescript
  import React, { createContext, useContext, useState, ReactNode } from 'react';

  interface User {
    uid: string;
    email: string;
    fullName?: string;
    role?: 'ADMIN' | 'PASSENGER' | 'DRIVER';
  }

  interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
  }

  const AuthContext = createContext<AuthContextType | undefined>(undefined);

  export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = (userData: User) => {
      setUser(userData);
    };

    const logout = () => {
      setUser(null);
    };

    return (
      <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
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
  ```

---

### Task 3: Create Global UI Primitives (Atomic Design)

**Files:**
- Create: `mobile/components/atoms/Typography.tsx`
- Create: `mobile/components/atoms/Button.tsx`
- Create: `mobile/components/molecules/FormField.tsx`

- [ ] **Step 1: Create Typography atom**
  Create `mobile/components/atoms/Typography.tsx`.
  ```typescript
  import React from 'react';
  import { Text, TextProps, StyleSheet } from 'react-native';

  interface TypographyProps extends TextProps {
    variant?: 'h1' | 'h2' | 'body' | 'caption' | 'error';
    color?: string;
  }

  export const Typography = ({ variant = 'body', color, style, children, ...props }: TypographyProps) => {
    const textStyle = [
      styles.base,
      styles[variant],
      color ? { color } : null,
      style,
    ];

    return (
      <Text style={textStyle} {...props}>
        {children}
      </Text>
    );
  };

  const styles = StyleSheet.create({
    base: {
      color: '#1A1A1A',
    },
    h1: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 8,
    },
    h2: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 6,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 22,
    },
    caption: {
      fontSize: 12,
      color: '#666666',
    },
    error: {
      fontSize: 12,
      color: '#EF4444',
      marginTop: 4,
    },
  });
  ```

- [ ] **Step 2: Create Button atom**
  Create `mobile/components/atoms/Button.tsx`.
  ```typescript
  import React from 'react';
  import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, GestureResponderEvent } from 'react-native';

  interface ButtonProps {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
  }

  export const Button = ({ title, onPress, disabled = false, loading = false, variant = 'primary' }: ButtonProps) => {
    const isInteractionDisabled = disabled || loading;

    const buttonStyles = [
      styles.baseButton,
      styles[`${variant}Button`],
      isInteractionDisabled && styles.disabledButton,
    ];

    const textStyles = [
      styles.baseText,
      styles[`${variant}Text`],
    ];

    return (
      <TouchableOpacity
        style={buttonStyles}
        onPress={onPress}
        disabled={isInteractionDisabled}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? '#007AFF' : '#FFFFFF'} />
        ) : (
          <Text style={textStyles}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    baseButton: {
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      flexDirection: 'row',
      marginVertical: 8,
    },
    primaryButton: {
      backgroundColor: '#007AFF',
    },
    secondaryButton: {
      backgroundColor: '#E6F4FE',
    },
    outlineButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#007AFF',
    },
    disabledButton: {
      backgroundColor: '#E0E0E0',
      borderColor: '#E0E0E0',
    },
    baseText: {
      fontSize: 16,
      fontWeight: '600',
    },
    primaryText: {
      color: '#FFFFFF',
    },
    secondaryText: {
      color: '#007AFF',
    },
    outlineText: {
      color: '#007AFF',
    },
  });
  ```

- [ ] **Step 3: Create FormField molecule**
  Create `mobile/components/molecules/FormField.tsx` by combining text input, typography, and styles.
  ```typescript
  import React from 'react';
  import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
  import { Typography } from '../atoms/Typography';

  interface FormFieldProps extends TextInputProps {
    label: string;
    error?: string;
  }

  export const FormField = ({ label, error, style, ...props }: FormFieldProps) => {
    return (
      <View style={styles.container}>
        <Typography variant="caption" style={styles.label}>
          {label}
        </Typography>
        <TextInput
          style={[styles.input, error ? styles.inputError : null, style]}
          placeholderTextColor="#999999"
          {...props}
        />
        {error ? (
          <Typography variant="error">
            {error}
          </Typography>
        ) : null}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      marginVertical: 8,
      width: '100%',
    },
    label: {
      marginBottom: 6,
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: '#D1D1D6',
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      color: '#1A1A1A',
      backgroundColor: '#FFFFFF',
    },
    inputError: {
      borderColor: '#EF4444',
    },
  });
  ```

- [ ] **Step 4: Update exports**
  Ensure newly created UI elements are properly exported by adding their exports to the component indexes later. For now, they are created directly.
