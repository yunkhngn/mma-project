import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { AuthScreenTemplate } from '@/components/templates';
import { AuthFormField, PasswordField, RoleSelector, SocialButton, OrDivider } from '@/components/molecules';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const [role, setRole] = useState<'passenger' | 'admin'>('passenger');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    try {
      await login(email.trim(), password, role);
    } catch (error: any) {
      console.error('Email Login Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error('Google Login Error:', error);
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <AuthScreenTemplate onBack={() => router.back()}>
      <Text className="text-2xl font-bold text-gray-900">Chào mừng trở lại</Text>
      <Text className="text-gray-500 text-sm mt-1">Đăng nhập để tiếp tục hành trình của bạn.</Text>

      <RoleSelector value={role} onChange={setRole} />

      <View className="mt-6 gap-y-4">
        <AuthFormField
          label="EMAIL HOẶC SỐ ĐIỆN THOẠI"
          value={email}
          onChangeText={setEmail}
          placeholder="nhap@email.com"
          keyboardType="email-address"
        />
        <PasswordField
          label="MẬT KHẨU"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />
        <TouchableOpacity className="self-end mt-1">
          <Text className="text-right text-xs text-gray-500 font-semibold">Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-8">
        <TouchableOpacity
          onPress={handleLogin}
          disabled={submitting || googleSubmitting}
          activeOpacity={0.85}
          className="bg-black py-4 rounded-full items-center justify-center"
        >
          {submitting
            ? <ActivityIndicator color="white" />
            : <Text className="text-white font-bold text-base uppercase tracking-wider">Đăng nhập</Text>}
        </TouchableOpacity>

        <OrDivider />

        <SocialButton
          label="Google"
          onPress={handleGoogleLogin}
          loading={googleSubmitting}
          disabled={submitting}
        />

        {role === 'passenger' && (
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            className="mt-6 self-center"
          >
            <Text className="text-center text-sm text-gray-500">
              Chưa có tài khoản?{' '}
              <Text className="text-black font-bold">Đăng ký</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </AuthScreenTemplate>
  );
}
