import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { parseError } from '@/utils/error-parser';
import { AuthScreenTemplate } from '@/components/templates';
import { AuthFormField, PasswordField, SocialButton, OrDivider } from '@/components/molecules';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const { showError, showSuccess } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      showError('Vui lòng nhập đầy đủ các trường bắt buộc');
      return;
    }
    if (password !== confirmPassword) {
      showError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 8) {
      showError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    setSubmitting(true);
    try {
      await register(fullName.trim(), email.trim(), phone.trim(), password);
      showSuccess('Tạo tài khoản thành công!');
    } catch (error: any) {
      console.error('Email Registration Error:', error);
      showError(parseError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      showSuccess('Đăng nhập Google thành công!');
    } catch (error: any) {
      console.error('Google Login Error:', error);
      showError(parseError(error));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <AuthScreenTemplate onBack={() => router.back()}>
      <Text className="text-2xl font-bold text-gray-900">Tạo tài khoản</Text>
      <Text className="text-gray-500 text-sm mt-1">Bắt đầu hành trình của bạn</Text>

      <View className="mt-6 gap-y-4">
        <AuthFormField
          label="HỌ VÀ TÊN *"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nhập họ và tên của bạn"
          autoCapitalize="words"
        />
        <AuthFormField
          label="EMAIL *"
          value={email}
          onChangeText={setEmail}
          placeholder="nhap@email.com"
          keyboardType="email-address"
        />
        <AuthFormField
          label="SỐ ĐIỆN THOẠI"
          value={phone}
          onChangeText={setPhone}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <PasswordField
          label="MẬT KHẨU *"
          value={password}
          onChangeText={setPassword}
          placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
        />
        <PasswordField
          label="XÁC NHẬN MẬT KHẨU *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Nhập lại mật khẩu"
        />
      </View>

      <View className="mt-8">
        <TouchableOpacity
          onPress={handleRegister}
          disabled={submitting || googleSubmitting}
          activeOpacity={0.85}
          className="bg-black py-4 rounded-full items-center justify-center"
        >
          {submitting
            ? <ActivityIndicator color="white" />
            : <Text className="text-white font-bold text-base uppercase tracking-wider">Đăng ký</Text>}
        </TouchableOpacity>

        <OrDivider />

        <SocialButton
          label="Google"
          onPress={handleGoogleLogin}
          loading={googleSubmitting}
          disabled={submitting}
        />

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          className="mt-6 self-center"
        >
          <Text className="text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Text className="text-black font-bold">Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenTemplate>
  );
}
