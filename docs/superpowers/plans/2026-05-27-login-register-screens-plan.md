# Onboarding & Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the onboarding, login, registration, and role-based app navigation flows using Firebase Auth and backend sync.

**Architecture:** We will set up a root `AuthProvider` context that determines whether to render the Auth Stack or the Passenger/Admin Tab Navigators based on the user's role.

**Tech Stack:** React Native, Expo Router, Firebase Auth, NativeWind v4 (TailwindCSS)

---

### Task 1: Create Auth Context

**Files:**
- Create: `mobile/src/context/auth-context.tsx`

- [ ] **Step 1: Create the AuthContext file**

Create the context provider that listens to Firebase's `onAuthStateChanged` and queries the backend using `authService` to resolve the user's role.

```typescript
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
      // Optionally update name/phone in backend if backend profile PUT is implemented
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
```

- [ ] **Step 2: Verify compiling**

Check that the context compiles successfully without syntax errors.

---

### Task 2: Configure Root Navigation Gate

**Files:**
- Modify: `mobile/src/app/_layout.tsx`

- [ ] **Step 1: Modify root layout file**

Wrap the navigation in `AuthProvider` and build the dynamic role-based routing controller.

```typescript
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme, ActivityIndicator, View } from 'react-native';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/auth-context';

function NavigationGate() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inPassengerGroup = segments[0] === '(passenger)';
    const inAdminGroup = segments[0] === '(admin)';

    if (!user) {
      // Redirect to onboarding if not authenticated
      if (!inAuthGroup) {
        router.replace('/(auth)/onboarding');
      }
    } else if (user.role === 'admin') {
      // Redirect to admin panel
      if (!inAdminGroup) {
        router.replace('/(admin)');
      }
    } else {
      // Redirect to passenger flow
      if (!inPassengerGroup) {
        router.replace('/(passenger)');
      }
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return <Slot />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <NavigationGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
```

---

### Task 3: Implement Auth Stack & Onboarding Screen

**Files:**
- Create: `mobile/src/app/(auth)/_layout.tsx`
- Create: `mobile/src/app/(auth)/onboarding.tsx`

- [ ] **Step 1: Create auth layout**

```typescript
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
```

- [ ] **Step 2: Create onboarding screen**

Match Onboarding screen UI style using custom backdrop, card layout, and social action buttons.

```typescript
import React from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Shield } from 'lucide-react-native';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      {/* Background Image Header */}
      <View className="h-[45%] w-full relative">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' }} 
          className="w-full h-full object-cover"
        />
        <View className="absolute inset-0 bg-black/10" />
        <Text className="absolute top-16 left-6 text-white text-3xl font-extrabold tracking-widest">
          Nomad
        </Text>
      </View>

      {/* Sheet Content Card */}
      <View className="flex-1 bg-white rounded-t-[32px] -mt-8 px-6 pt-8 pb-10 justify-between">
        <View className="items-center">
          <Text className="text-2xl font-bold text-center text-gray-900 leading-snug">
            Khởi hành chuyến xe của bạn ngay hôm nay.
          </Text>
          <Text className="text-center text-gray-500 mt-3 text-sm leading-relaxed px-4">
            Đặt vé xe khách cao cấp, khám phá các tuyến đường mới và di chuyển liền mạch.
          </Text>
        </View>

        {/* Buttons */}
        <View className="gap-y-3 mt-6">
          <TouchableOpacity 
            onPress={() => router.push('/(auth)/login')}
            className="bg-black py-4 rounded-full flex-row justify-center items-center gap-x-2"
          >
            <Mail size={18} color="white" />
            <Text className="text-white font-semibold text-base">Tiếp tục với Email</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-50 border border-gray-200 py-4 rounded-full flex-row justify-center items-center gap-x-2">
            <Text className="text-gray-800 font-semibold text-base"> Tiếp tục với Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-50 border border-gray-200 py-4 rounded-full flex-row justify-center items-center gap-x-2">
            <Text className="text-gray-800 font-semibold text-base"> Tiếp tục với Google</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Legal Terms */}
        <Text className="text-center text-xs text-gray-400 mt-4 leading-normal">
          Bằng việc chọn tiếp tục, bạn đồng ý với{' '}
          <Text className="underline text-gray-600 font-medium">Điều khoản Dịch vụ</Text> và{' '}
          <Text className="underline text-gray-600 font-medium">Chính sách Bảo mật</Text>.
        </Text>
      </View>
    </View>
  );
}
```

---

### Task 4: Implement Login Screen

**Files:**
- Create: `mobile/src/app/(auth)/login.tsx`

- [ ] **Step 1: Create login screen**

Includes role switcher tab, text inputs, password eye toggle, and submit handler tied to Firebase auth.

```typescript
import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [role, setRole] = useState<'passenger' | 'admin'>('passenger');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password, role);
    } catch (error: any) {
      Alert.alert('Đăng nhập thất bại', error.message || 'Đã xảy ra lỗi vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Background Image Header */}
      <View className="h-[30%] w-full relative">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' }} 
          className="w-full h-full object-cover"
        />
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-14 left-5 bg-white/20 p-2 rounded-full"
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main card */}
      <View className="flex-1 bg-white rounded-t-[32px] -mt-8 px-6 pt-8 pb-10 justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Chào mừng trở lại</Text>
          <Text className="text-gray-500 text-sm mt-1">Đăng nhập để tiếp tục hành trình của bạn.</Text>

          {/* Role Switcher */}
          <View className="flex-row bg-gray-100 p-1.5 rounded-full mt-6">
            <TouchableOpacity 
              onPress={() => setRole('passenger')}
              className={`flex-1 py-3 rounded-full items-center ${role === 'passenger' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-semibold text-sm ${role === 'passenger' ? 'text-gray-900' : 'text-gray-500'}`}>
                Hành khách
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setRole('admin')}
              className={`flex-1 py-3 rounded-full items-center ${role === 'admin' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-semibold text-sm ${role === 'admin' ? 'text-gray-900' : 'text-gray-500'}`}>
                Quản trị viên
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View className="mt-6 gap-y-4">
            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">
                EMAIL HOẶC SỐ ĐIỆN THOẠI
              </Text>
              <TextInput 
                value={email}
                onChangeText={setEmail}
                placeholder="nhap@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-800 text-base"
              />
            </View>

            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">
                MẬT KHẨU
              </Text>
              <View className="relative">
                <TextInput 
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-12 py-4 text-gray-800 text-base"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity className="align-self-end mt-1">
              <Text className="text-right text-xs text-gray-500 font-semibold">Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-8">
          <TouchableOpacity 
            onPress={handleLogin}
            disabled={submitting}
            className="bg-black py-4 rounded-full items-center justify-center"
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base uppercase tracking-wider">Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="mx-4 text-xs text-gray-400">hoặc tiếp tục với</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          <TouchableOpacity className="border border-gray-200 py-4 rounded-full flex-row justify-center items-center gap-x-2">
            <Text className="text-gray-800 font-semibold text-base">Google</Text>
          </TouchableOpacity>

          {role === 'passenger' && (
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/register')}
              className="mt-6 align-self-center"
            >
              <Text className="text-center text-sm text-gray-500">
                Chưa có tài khoản? <Text className="text-black font-bold">Đăng ký</Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
```

---

### Task 5: Implement Register Screen

**Files:**
- Create: `mobile/src/app/(auth)/register.tsx`

- [ ] **Step 1: Create registration screen**

Collects Full Name, Email, Password, and Confirm Password; submits directly to Firebase.

```typescript
import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ các trường bắt buộc');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    setSubmitting(true);
    try {
      await register(fullName.trim(), email.trim(), phone.trim(), password);
      Alert.alert('Thành công', 'Tạo tài khoản thành công!');
    } catch (error: any) {
      Alert.alert('Đăng ký thất bại', error.message || 'Đã xảy ra lỗi vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-black" contentContainerStyle={{ flexGrow: 1 }}>
      {/* Header banner */}
      <View className="h-[25%] w-full relative">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' }} 
          className="w-full h-full object-cover"
        />
        <TouchableOpacity 
          onPress={() => router.back()}
          className="absolute top-14 left-5 bg-white/20 p-2 rounded-full"
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main card */}
      <View className="flex-1 bg-white rounded-t-[32px] -mt-8 px-6 pt-8 pb-10 justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Tạo tài khoản</Text>
          <Text className="text-gray-500 text-sm mt-1">Bắt đầu hành trình của bạn cùng Nomad</Text>

          {/* Form */}
          <View className="mt-6 gap-y-4">
            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">HỌ VÀ TÊN *</Text>
              <TextInput 
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ và tên của bạn"
                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-800 text-base"
              />
            </View>

            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">EMAIL *</Text>
              <TextInput 
                value={email}
                onChangeText={setEmail}
                placeholder="nhap@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-800 text-base"
              />
            </View>

            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">SỐ ĐIỆN THOẠI</Text>
              <TextInput 
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                keyboardType="phone-pad"
                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-gray-800 text-base"
              />
            </View>

            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">MẬT KHẨU *</Text>
              <View className="relative">
                <TextInput 
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-12 py-4 text-gray-800 text-base"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">XÁC NHẬN MẬT KHẨU *</Text>
              <View className="relative">
                <TextInput 
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Nhập lại mật khẩu"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  className="bg-gray-50 border border-gray-100 rounded-2xl pl-4 pr-12 py-4 text-gray-800 text-base"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4"
                >
                  {showConfirmPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-8">
          <TouchableOpacity 
            onPress={handleRegister}
            disabled={submitting}
            className="bg-black py-4 rounded-full items-center justify-center"
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base uppercase tracking-wider">Đăng ký</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="mx-4 text-xs text-gray-400">hoặc tiếp tục với</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          <TouchableOpacity className="border border-gray-200 py-4 rounded-full flex-row justify-center items-center gap-x-2">
            <Text className="text-gray-800 font-semibold text-base">Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/(auth)/login')}
            className="mt-6 align-self-center"
          >
            <Text className="text-center text-sm text-gray-500">
              Đã có tài khoản? <Text className="text-black font-bold">Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
```

---

### Task 6: Implement Passenger Navigation Layout & Placeholders

**Files:**
- Create: `mobile/src/app/(passenger)/_layout.tsx`
- Create: `mobile/src/app/(passenger)/index.tsx`
- Create: `mobile/src/app/(passenger)/favorites.tsx`
- Create: `mobile/src/app/(passenger)/bookings.tsx`
- Create: `mobile/src/app/(passenger)/messages.tsx`

- [ ] **Step 1: Create passenger tab navigation**

```typescript
import React from 'react';
import { Tabs } from 'expo-router';
import { Compass, Heart, Calendar, MessageSquare, LogOut } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/auth-context';

export default function PassengerLayout() {
  const { logout } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#000000',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: {
        paddingTop: 5,
        paddingBottom: 25,
        height: 85,
      },
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={{ marginRight: 20 }}>
          <LogOut size={20} color="#ef4444" />
        </TouchableOpacity>
      ),
    }}>
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="favorites" 
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="bookings" 
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="messages" 
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        }} 
      />
    </Tabs>
  );
}
```

- [ ] **Step 2: Create simple dashboard content**

For `mobile/src/app/(passenger)/index.tsx`:

```typescript
import React from 'react';
import { View, Text } from 'react-native';

export default function PassengerDashboard() {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold text-gray-800">Passenger Dashboard</Text>
      <Text className="text-gray-500 mt-2 text-center">Chào mừng bạn đã đăng nhập thành công với vai trò Hành khách!</Text>
    </View>
  );
}
```

- [ ] **Step 3: Create other tab views**

For `mobile/src/app/(passenger)/favorites.tsx`:
```typescript
import React from 'react';
import { View, Text } from 'react-native';

export default function FavoritesScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg font-semibold text-gray-800">Favorites (Trống)</Text>
    </View>
  );
}
```

For `mobile/src/app/(passenger)/bookings.tsx`:
```typescript
import React from 'react';
import { View, Text } from 'react-native';

export default function BookingsScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg font-semibold text-gray-800">Bookings (Trống)</Text>
    </View>
  );
}
```

For `mobile/src/app/(passenger)/messages.tsx`:
```typescript
import React from 'react';
import { View, Text } from 'react-native';

export default function MessagesScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg font-semibold text-gray-800">Messages (Trống)</Text>
    </View>
  );
}
```

---

### Task 7: Implement Admin Navigation Layout & Placeholders

**Files:**
- Create: `mobile/src/app/(admin)/_layout.tsx`
- Create: `mobile/src/app/(admin)/index.tsx`
- Create: `mobile/src/app/(admin)/chats.tsx`
- Create: `mobile/src/app/(admin)/settings.tsx`

- [ ] **Step 1: Create admin tab navigation**

```typescript
import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, MessageSquareCode, Settings, LogOut } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/auth-context';

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#208AEF',
      tabBarInactiveTintColor: '#9ca3af',
      tabBarStyle: {
        paddingTop: 5,
        paddingBottom: 25,
        height: 85,
      },
      headerRight: () => (
        <TouchableOpacity onPress={logout} style={{ marginRight: 20 }}>
          <LogOut size={20} color="#ef4444" />
        </TouchableOpacity>
      ),
    }}>
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="chats" 
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => <MessageSquareCode color={color} size={size} />,
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }} 
      />
    </Tabs>
  );
}
```

- [ ] **Step 2: Create admin index dashboard**

For `mobile/src/app/(admin)/index.tsx`:

```typescript
import React from 'react';
import { View, Text } from 'react-native';

export default function AdminDashboard() {
  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold text-gray-800">Admin Dashboard</Text>
      <Text className="text-gray-500 mt-2 text-center">Chào mừng bạn đã đăng nhập thành công với vai trò Quản trị viên!</Text>
    </View>
  );
}
```

- [ ] **Step 3: Create other admin screens**

For `mobile/src/app/(admin)/chats.tsx`:
```typescript
import React from 'react';
import { View, Text } from 'react-native';

export default function ChatsScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg font-semibold text-gray-800">Chats (Trống)</Text>
    </View>
  );
}
```

For `mobile/src/app/(admin)/settings.tsx`:
```typescript
import React from 'react';
import { View, Text } from 'react-native';

export default function SettingsScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg font-semibold text-gray-800">Settings (Trống)</Text>
    </View>
  );
}
```
